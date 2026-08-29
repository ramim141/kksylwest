import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import { archiveDetailsData } from './components/gallery/archiveDetailsData';

import MobileBottomNav from './components/common/MobileBottomNav';
import { PageTransition, RouteFallback, ScrollToTop, DeferredSection } from './components/common';
import { routeLoaders, prefetchLikelyRoutes, installLinkPrefetch } from './routes';

/* The chat bubble is ~600 lines of widget behind a closed launcher. Nothing
   is visible until it is tapped, so it has no business in the entry chunk —
   <DeferredSection> mounts it once the browser is idle. */
const ChatbotWidget = lazy(() => import('./components/chat/ChatbotWidget'));

/* Every route except the landing page is code-split: the first paint
   ships only the Home chunk, and the rest arrive behind a skeleton
   instead of blocking the whole bundle.

   The loaders live in ./routes so the prefetcher can warm the exact same
   chunk on hover — see prefetchRoute there. */
const About = lazy(routeLoaders['/about']);
const Contact = lazy(routeLoaders['/contact']);
const Notice = lazy(routeLoaders['/notice']);
const Gallery = lazy(routeLoaders['/gallery']);
const GalleryGridDetails = lazy(routeLoaders['/gallery/details']);
const GalleryDocumentaryDetails = lazy(routeLoaders['/gallery/documentary']);
const ResultList = lazy(routeLoaders['/list']);
const ScholarshipDetails = lazy(routeLoaders['/scholarship']);
const SearchPage = lazy(routeLoaders['/search']);
const OnlineRegistration = lazy(routeLoaders['/register']);
const AdmitCardPortal = lazy(routeLoaders['/admit-card']);
const MeritLeaderboard = lazy(routeLoaders['/leaderboard']);
const CertificateVerification = lazy(routeLoaders['/verify-certificate']);
const AdminLogin = lazy(routeLoaders['/admin/login']);
const AdminDashboard = lazy(routeLoaders['/admin']);
const ProtectedRoute = lazy(routeLoaders['/admin/guard']);

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ExamYearProvider } from './context/ExamYearContext';
import { BrandingProvider } from './context/BrandingContext';

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  /* Once the landing page has settled, quietly pull the chunks behind the
     links people actually take from it. By the time a tap lands the page is
     usually already in memory, so the route skeleton never appears at all. */
  useEffect(() => {
    if (isAdminRoute) return undefined;
    prefetchLikelyRoutes();
    // Any internal link anywhere on the page warms its own chunk on hover.
    return installLinkPrefetch();
  }, [isAdminRoute]);

  return (
    /* `app-shell` replaces the old `overflow-x-hidden` here: `hidden` made
       this wrapper a scroll container, and a sticky header sticks to its
       nearest scroll container — so the header scrolled away instead of
       pinning, most visibly on mobile. See the rule in index.css. */
    <div className="app-shell flex flex-col min-h-screen font-sans transition-colors duration-300 bg-surface text-ink-body">
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}

      <main className="flex flex-col flex-grow w-full pb-16 md:pb-0">
        <PageTransition>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/notice" element={<Notice />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/gallery/archive/:id" element={<GalleryGridDetails detailsData={archiveDetailsData} />} />
              <Route path="/gallery/:id" element={<GalleryGridDetails />} />
              <Route path="/gallery/documentary/:id" element={<GalleryDocumentaryDetails />} />
              <Route path="/list" element={<ResultList />} />
              <Route path="/scholarship" element={<ScholarshipDetails />} />
              <Route path="/register" element={<OnlineRegistration />} />
              <Route path="/admit-card" element={<AdmitCardPortal />} />
              <Route path="/admit" element={<AdmitCardPortal />} />
              <Route path="/leaderboard" element={<MeritLeaderboard />} />
              <Route path="/merit-list" element={<MeritLeaderboard />} />
              <Route path="/verify-certificate" element={<CertificateVerification />} />
              <Route path="/certificate" element={<CertificateVerification />} />
              <Route path="/search" element={<SearchPage />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </PageTransition>
      </main>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && (
        <DeferredSection>
          <ChatbotWidget />
        </DeferredSection>
      )}
      {!isAdminRoute && <MobileBottomNav />}
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ExamYearProvider>
          <BrandingProvider>
            <AppContent />
          </BrandingProvider>
        </ExamYearProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
