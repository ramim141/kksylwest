"""
Downscale and re-encode the bundled photography.

The images under src/assets/images were camera originals — 6000x4000 at
5-22MB each — served straight to phones that display them 375px wide. That
was ~63MB on the wire for a single visit, and it dominated load time far
more than any JavaScript on the site.

This script rewrites them in place at a size the layout can actually use,
after copying every original to assets-originals/ at the repo root. Run it
again after adding new photos; anything already within the limits is left
untouched, so it is safe to re-run.

    python scripts/optimizeImages.py            # optimise
    python scripts/optimizeImages.py --dry-run  # report only
    python scripts/optimizeImages.py --restore  # put the originals back
"""

from __future__ import annotations

import argparse
import os
import shutil
import sys

from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE_DIR = os.path.join(ROOT, "src", "assets", "images")
BACKUP_DIR = os.path.join(ROOT, "assets-originals")

# The widest this site ever paints a photo is a full-bleed hero on a large
# desktop. 1920 covers that at 1x and a phone at 3x, with nothing to spare
# being wasted on pixels no one sees.
MAX_EDGE = 1920
JPEG_QUALITY = 82
# Logos and icons are small, already tuned, and lose more than they gain.
SKIP_UNDER_BYTES = 250_000
EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp")


def iter_images(base: str):
    for folder, _dirs, files in os.walk(base):
        for name in sorted(files):
            if name.lower().endswith(EXTENSIONS):
                yield os.path.join(folder, name)


def human(size: float) -> str:
    return f"{size / 1_000_000:.2f}MB" if size >= 1_000_000 else f"{size / 1000:.0f}KB"


def backup_path(path: str) -> str:
    return os.path.join(BACKUP_DIR, os.path.relpath(path, SOURCE_DIR))


def restore() -> int:
    if not os.path.isdir(BACKUP_DIR):
        print(f"No backup at {BACKUP_DIR} — nothing to restore.")
        return 1

    count = 0
    for folder, _dirs, files in os.walk(BACKUP_DIR):
        for name in files:
            src = os.path.join(folder, name)
            dst = os.path.join(SOURCE_DIR, os.path.relpath(src, BACKUP_DIR))
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(src, dst)
            count += 1
    print(f"Restored {count} original images into {SOURCE_DIR}")
    return 0


def optimise(path: str, dry_run: bool) -> tuple[int, int]:
    """Returns (bytes_before, bytes_after). Equal values mean 'left alone'."""
    before = os.path.getsize(path)
    if before < SKIP_UNDER_BYTES:
        return before, before

    with Image.open(path) as raw:
        # EXIF orientation has to be baked in before the resize, or a portrait
        # photo shot sideways comes out rotated once the tag is dropped.
        image = ImageOps.exif_transpose(raw)
        width, height = image.size
        is_png = path.lower().endswith(".png")
        has_alpha = image.mode in ("RGBA", "LA", "P")

        scale = min(1.0, MAX_EDGE / max(width, height))
        if scale >= 1.0 and before < 1_500_000:
            return before, before

        if scale < 1.0:
            image = image.resize(
                (round(width * scale), round(height * scale)),
                Image.LANCZOS,
            )

        if dry_run:
            projected = int(before * (scale ** 2) * 0.35)
            return before, min(before, max(projected, 20_000))

        # Written to a temp path and moved into place: an interrupted write
        # must never leave a truncated image where the original was.
        tmp = path + ".opt.tmp"
        if is_png and has_alpha:
            image.save(tmp, "PNG", optimize=True)
        else:
            image.convert("RGB").save(
                tmp,
                "JPEG",
                quality=JPEG_QUALITY,
                optimize=True,
                progressive=True,
            )

    if os.path.getsize(tmp) >= before:
        # Re-encoding made it bigger (already well compressed) — keep the original.
        os.remove(tmp)
        return before, before

    os.replace(tmp, path)
    return before, os.path.getsize(path)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="report without writing")
    parser.add_argument("--restore", action="store_true", help="copy originals back")
    args = parser.parse_args()

    if args.restore:
        return restore()

    if not os.path.isdir(SOURCE_DIR):
        print(f"Not found: {SOURCE_DIR}")
        return 1

    images = list(iter_images(SOURCE_DIR))
    if not images:
        print("No images found.")
        return 0

    if not args.dry_run:
        for path in images:
            target = backup_path(path)
            if os.path.exists(target):
                continue  # already backed up on an earlier run — never overwrite
            os.makedirs(os.path.dirname(target), exist_ok=True)
            shutil.copy2(path, target)
        print(f"Originals backed up to {BACKUP_DIR}\n")

    total_before = total_after = 0
    changed = 0

    for path in images:
        before, after = optimise(path, args.dry_run)
        total_before += before
        total_after += after
        if after < before:
            changed += 1
            rel = os.path.relpath(path, ROOT)
            print(f"  {human(before):>9} -> {human(after):>9}  {rel}")

    saved = total_before - total_after
    print(
        f"\n{changed} of {len(images)} images rewritten"
        f"{' (dry run)' if args.dry_run else ''}\n"
        f"{human(total_before)} -> {human(total_after)}"
        f"  ({saved / total_before * 100:.1f}% smaller)"
    )
    if not args.dry_run:
        print(f"\nRestore anytime with: python scripts/optimizeImages.py --restore")
    return 0


if __name__ == "__main__":
    sys.exit(main())
