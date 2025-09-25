
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import DisclaimerPage from './pages/DisclaimerPage';
import FeaturesPage from './pages/FeaturesPage';
import HelpCenterPage from './pages/HelpCenterPage';
import CommunityPage from './pages/CommunityPage';
import FaqPage from './pages/FaqPage';
import BlogPage from './pages/BlogPage';
import ArticlePage from './pages/ArticlePage';
import ImageHistoryPage from './pages/ImageHistoryPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-black text-gray-200 font-sans flex flex-col">
        <div className="relative z-10 flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                <Route path="/disclaimer" element={<DisclaimerPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/help" element={<HelpCenterPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<ArticlePage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/history" element={<ImageHistoryPage />} />
              </Routes>
            </main>
            <Footer />
        </div>
      </div>
    </HashRouter>
  );
};

export default App;