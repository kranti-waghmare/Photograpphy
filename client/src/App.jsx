import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { StudioProvider } from './context/StudioContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastBanner from './components/ToastBanner';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CareersPage from './pages/CareersPage';
import PortfolioPage from './pages/PortfolioPage';
import PhotographersPage from './pages/PhotographersPage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/photographers" element={<PhotographersPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/:bookingId" element={<PaymentPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <StudioProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f5f2eb]">
          <Navbar />
          <div className="flex-1">
            <AnimatedRoutes />
          </div>
          <Footer />
          <ToastBanner />
        </div>
      </BrowserRouter>
    </StudioProvider>
  );
}
