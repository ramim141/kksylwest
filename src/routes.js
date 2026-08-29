/* ============================================================
   ROUTE CHUNK REGISTRY

   Every code-split page is declared once, here, and used twice: React
   turns each loader into a <Suspense> boundary, and the prefetcher calls
   the same loader early so the chunk is already in cache by the time the
   click lands. Because both sides share one static import specifier, the
   bundler still emits a single chunk per page.

   Prefetching is what removes the skeleton from most navigations: on a
   phone a route chunk is a 150-300ms round trip, which is exactly long
   enough to see. Started on hover, focus or touch-down, that trip
   overlaps the ~200ms before the tap completes.
   ============================================================ */

export const routeLoaders = {
  '/about': () => import('./components/About'),
  '/contact': () => import('./components/Contact'),
  '/notice': () => import('./components/Notice'),
  '/gallery': () => import('./components/Gallery'),
  '/gallery/details': () => import('./components/gallery/GalleryGridDetails'),
  '/gallery/documentary': () => import('./components/gallery/GalleryDocumentaryDetails'),
  '/list': () => import('./components/result/ResultList'),
  '/scholarship': () => import('./components/scholarship/ScholarshipDetails'),
  '/search': () => import('./components/result/SearchPage'),
  '/register': () => import('./components/scholarship/OnlineRegistration'),
  '/admit-card': () => import('./components/scholarship/AdmitCardPortal'),
  '/leaderboard': () => import('./components/result/MeritLeaderboard'),
  '/verify-certificate': () => import('./components/result/CertificateVerification'),
  '/admin/login': () => import('./components/admin/AdminLogin'),
  '/admin': () => import('./components/admin/AdminDashboard'),
  '/admin/guard': () => import('./components/admin/ProtectedRoute'),
};

/** Paths that share a chunk with one of the keys above. */
const ALIASES = {
  '/admit': '/admit-card',
  '/merit-list': '/leaderboard',
  '/certificate': '/verify-certificate',
};

const started = new Set();

/** Resolves a URL path to the loader whose chunk renders it. */
const loaderFor = (path = '') => {
  const clean = (ALIASES[path] || path).toLowerCase().replace(/\/+$/, '') || '/';
  if (routeLoaders[clean]) return routeLoaders[clean];

  // Album and documentary detail URLs carry an id segment.
  if (clean.startsWith('/gallery/documentary')) return routeLoaders['/gallery/documentary'];
  if (clean.startsWith('/gallery/')) return routeLoaders['/gallery/details'];
  return null;
};

/**
 * Warms one route's chunk. Safe to call on every hover — each loader runs at
 * most once, and a failure is ignored: this is an optimisation, and the real
 * navigation will surface any genuine load error itself.
 */
export const prefetchRoute = (path) => {
  const key = ALIASES[path] || path;
  if (!key || started.has(key)) return;

  const loader = loaderFor(path);
  if (!loader) return;

  started.add(key);
  loader().catch(() => started.delete(key));
};

/**
 * Spread over consecutive idle callbacks rather than fired at once: a burst
 * of parallel chunk requests on a slow connection competes with the images
 * and data the visible page is still waiting for.
 */
export const prefetchLikelyRoutes = (paths = ['/search', '/admit-card', '/leaderboard', '/notice']) => {
  if (typeof window === 'undefined') return;

  // A metered or 2G connection should spend its bytes on what was asked for.
  const conn = navigator.connection;
  if (conn?.saveData || /2g/.test(conn?.effectiveType || '')) return;

  const schedule = (fn) =>
    'requestIdleCallback' in window
      ? window.requestIdleCallback(fn, { timeout: 3000 })
      : setTimeout(fn, 300);

  const queue = [...paths];
  const step = () => {
    const next = queue.shift();
    if (!next) return;
    prefetchRoute(next);
    schedule(step);
  };

  schedule(step);
};

/**
 * Props to spread onto a single <Link> that needs its own handling. Most
 * links are covered by the delegated listener below and need nothing.
 */
export const prefetchProps = (path) => ({
  onMouseEnter: () => prefetchRoute(path),
  onFocus: () => prefetchRoute(path),
  onTouchStart: () => prefetchRoute(path),
});

let listening = false;

/**
 * One delegated listener for every internal link on the site — nav, footer,
 * bottom bar, hero buttons, cards. Attaching handlers to each <Link> would
 * mean touching a hundred call sites and missing the next one someone adds;
 * this catches them all from a single place.
 *
 * `pointerover` fires constantly, but the work per event is a `closest()`
 * lookup and a Set check: each chunk is requested at most once, so the
 * handler goes inert almost immediately.
 */
export const installLinkPrefetch = () => {
  if (typeof document === 'undefined' || listening) return () => {};
  listening = true;

  const onIntent = (event) => {
    const anchor = event.target?.closest?.('a[href]');
    if (!anchor) return;
    // Leave external links, downloads and new-tab links alone.
    if (anchor.origin !== window.location.origin) return;
    if (anchor.hasAttribute('download')) return;
    if (anchor.target && anchor.target !== '_self') return;

    prefetchRoute(anchor.pathname);
  };

  const opts = { passive: true, capture: true };
  document.addEventListener('pointerover', onIntent, opts);
  document.addEventListener('touchstart', onIntent, opts);
  document.addEventListener('focusin', onIntent, opts);

  return () => {
    listening = false;
    document.removeEventListener('pointerover', onIntent, opts);
    document.removeEventListener('touchstart', onIntent, opts);
    document.removeEventListener('focusin', onIntent, opts);
  };
};
