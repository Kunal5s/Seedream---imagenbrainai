
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
import HelpCenterPage from './pages/HelpCenterPage';
import CommunityPage from './pages/CommunityPage';
import FaqPage from './pages/FaqPage';
import BlogPage from './pages/BlogPage';
import ArticlePage from './pages/ArticlePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const App: React.FC = () => {
  return (
    <ReactRouterDom.HashRouter>
      <div className="min-h-screen bg-black text-gray-200 font-sans flex flex-col">
        <div className="relative z-10 flex flex-col min-h-screen">
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
                <ReactRouterDom.Route path="/help" element={<HelpCenterPage />} />
                <ReactRouterDom.Route path="/community" element={<CommunityPage />} />
                <ReactRouterDom.Route path="/blog" element={<BlogPage />} />
                <ReactRouterDom.Route path="/blog/:slug" element={<ArticlePage />} />
                <ReactRouterDom.Route path="/faq" element={<FaqPage />} />
                <ReactRouterDom.Route path="/login" element={<LoginPage />} />
                <ReactRouterDom.Route path="/signup" element={<SignupPage />} />
                <ReactRouterDom.Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <ReactRouterDom.Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                <ReactRouterDom.Route path="/profile" element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                } />
              </ReactRouterDom.Routes>
            </main>
            <Footer />
        </div>
      </div>
    </ReactRouterDom.HashRouter>
  );
};

export default App;
