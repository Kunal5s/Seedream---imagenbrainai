import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import DisclaimerPage from './pages/DisclaimerPage';
import FeaturesPage from './pages/FeaturesPage';
import BlogPage from './pages/BlogPage';
import ArticlePage from './pages/ArticlePage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-900/50 bg-gradient-to-b from-black via-gray-900 to-black text-gray-200 font-sans flex flex-col">
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
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<ArticlePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;