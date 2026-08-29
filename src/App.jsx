import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import { archiveDetailsData } from './components/gallery/archiveDetailsData';
import ChatbotWidget from './components/chat/ChatbotWidget';

import BreakingNewsBar from './components/common/BreakingNewsBar';
import MobileBottomNav from './components/common/MobileBottomNav';
import { PageTransition, RouteFallback, ScrollToTop } from './components/common';

/* Every route except the landing page is code-split: the first paint
   ships only the Home chunk, and the rest arrive behind a skeleton
   instead of blocking the whole bundle. */
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const Notice = lazy(() => import('./components/Notice'));
const Gallery = lazy(() => import('./components/Gallery'));
const GalleryGridDetails = lazy(() => import('./components/gallery/GalleryGridDetails'));
const GalleryDocumentaryDetails = lazy(() => import('./components/gallery/GalleryDocumentaryDetails'));
const ResultList = lazy(() => import('./components/result/ResultList'));
const ScholarshipDetails = lazy(() => import('./components/scholarship/ScholarshipDetails'));
const SearchPage = lazy(() => import('./components/result/SearchPage'));
const OnlineRegistration = lazy(() => import('./components/scholarship/OnlineRegistration'));
const AdmitCardPortal = lazy(() => import('./components/scholarship/AdmitCardPortal'));
const MeritLeaderboard = lazy(() => import('./components/result/MeritLeaderboard'));
const CertificateVerification = lazy(() => import('./components/result/CertificateVerification'));
const AdminLogin = lazy(() => import('./components/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const ProtectedRoute = lazy(() => import('./components/admin/ProtectedRoute'));

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ExamYearProvider } from './context/ExamYearContext';
import { BrandingProvider } from './context/BrandingContext';

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden font-sans transition-colors duration-300 bg-surface text-ink-body">
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
      {!isAdminRoute && <ChatbotWidget />}
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
