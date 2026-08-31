import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/* Vendor code changes on a different clock than page code: React and the
   Firebase SDK are stable for months, while the pages change weekly. Left
   alone, Rollup folds every shared import into one ~1MB entry chunk, so a
   one-line copy edit invalidates the whole download for returning visitors.
   Splitting them out gives each its own long-lived cache entry, and lets the
   browser fetch them in parallel instead of end-to-end. */
const vendorChunks = [
  // Router has to be present before anything renders — keep it with React.
  [/node_modules\/(react|react-dom|scheduler|react-router|react-router-dom)\//, 'react-vendor'],
  /* Sign-in is admin-only and loaded on demand, but this list is matched in
     order and the Firebase rule below would otherwise swallow it into the
     chunk every public page downloads. Keeping it separate is worth ~74KB to
     everyone who never visits /admin. */
  [/node_modules\/(@firebase|firebase)\/auth/, 'firebase-auth-vendor'],
  // ~300KB, and only reached once a page actually asks for data.
  [/node_modules\/(@firebase|firebase)\//, 'firebase-vendor'],
  // Icon sets: large, and shared by every page.
  [/node_modules\/(react-icons|lucide-react)\//, 'icons-vendor'],
  // Carousel — the home page's activities rail only.
  [/node_modules\/swiper/, 'swiper-vendor'],
  // Canvas rasteriser behind the admit card / certificate downloads.
  [/node_modules\/html-to-image/, 'image-export-vendor'],
  // Spreadsheet parser: admin bulk upload, never on a public page.
  [/node_modules\/xlsx/, 'xlsx-vendor'],
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Honour an externally assigned port (falls back to Vite's default 5173)
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
  build: {
    // Every browser this site supports has had these for years; not
    // down-levelling saves both bytes and parse time.
    target: 'es2020',
    cssCodeSplit: true,
    // Source maps would otherwise be absent, and a 1MB bundle is unreadable
    // in production error reports without them. They are a separate file,
    // so visitors never download them.
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          const normalised = id.replace(/\\/g, '/')
          const match = vendorChunks.find(([pattern]) => pattern.test(normalised))
          return match ? match[1] : 'vendor'
        },
      },
    },
  },
  // Pre-bundling these on first `npm run dev` keeps the initial page load from
  // stalling on a few hundred separate module requests.
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
