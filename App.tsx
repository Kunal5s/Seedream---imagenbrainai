import React from 'react';
// FIX: Use namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDom from 'react-router-dom';
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
    <ReactRouterDom.HashRouter>
      <div className="min-h-screen bg-gray-900/50 bg-gradient-to-b from-black via-gray-900 to-black text-gray-200 font-sans flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <ReactRouterDom.Routes>
            <ReactRouterDom.Route path="/" element={<HomePage />} />
            <ReactRouterDom.Route path="/about" element={<AboutPage />} />
            <ReactRouterDom.Route path="/contact" element={<ContactPage />} />
            <ReactRouterDom.Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <ReactRouterDom.Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <ReactRouterDom.Route path="/disclaimer" element={<DisclaimerPage />} />
            <ReactRouterDom.Route path="/features" element={<FeaturesPage />} />
            <ReactRouterDom.Route path="/blog" element={<BlogPage />} />
            <ReactRouterDom.Route path="/blog/:slug" element={<ArticlePage />} />
          </ReactRouterDom.Routes>
        </main>
        <Footer />
      </div>
    </ReactRouterDom.HashRouter>
  );
};

export default App;
