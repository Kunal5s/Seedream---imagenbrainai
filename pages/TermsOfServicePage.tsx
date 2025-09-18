import React from 'react';
import MetaTags from '../components/MetaTags';

const TermsOfServicePage: React.FC = () => {
  return (
    <>
      <MetaTags
        title="Terms of Service | Seedream ImagenBrainAi 4.0"
        description="Review the Terms of Service for Seedream ImagenBrainAi 4.0. Learn about your rights and responsibilities when using our AI image generation platform."
        canonicalPath="/terms-of-service"
      />
      <div className="max-w-4xl mx-auto prose prose-invert prose-headings:text-green-300 prose-a:text-green-300">
        <h1>Terms of Service</h1>
        <p className="text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
        <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Seedream ImagenBrainAi 4.0 website and services (the "Service") operated by Seedream Innovations Inc. ("us", "we", or "our").</p>
        <p>Your access to and use of the Service is conditioned upon your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who wish to access or use the Service. By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you do not have permission to access the Service.</p>

        <h2>1. Accounts</h2>
        <p>When you create an account with us, you guarantee that you are above the age of 13, and that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the Service.</p>
        
        <h3>1.1 Account Security</h3>
        <p>You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password.</p>

        <h2>2. User Content</h2>
        <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("User Content"). You are responsible for the User Content that you post on or through the Service, including its legality, reliability, and appropriateness.</p>

        <h3>2.1. Ownership of Content</h3>
        <p>You retain any and all of your rights to any User Content you submit, post or display on or through the Service and you are responsible for protecting those rights. We take no responsibility and assume no liability for User Content you or any third-party posts on or through the Service.</p>
        <h4>2.2. License to Us</h4>
        <p>By posting User Content on or through the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, modify, publicly perform, publicly display, reproduce, and distribute such User Content on and through the Service. This license is for the sole purpose of providing and improving the Service.</p>
        
        <h5>2.3. Prohibited Content</h5>
        <p>You agree not to post User Content that is illegal, obscene, defamatory, threatening, infringing of intellectual property rights, invasive of privacy or otherwise injurious to third parties. We reserve the right to remove any content that violates these terms.</p>
        <h6>Content Moderation</h6>
        <p>We have the right, but not the obligation, to monitor and edit all User Content provided by users. We may use automated systems to screen User Content for harmful or illegal material.</p>

        <h2>3. Prohibited Uses</h2>
        <p>You may use the Service only for lawful purposes. You may not use the Service:</p>
        <ul>
          <li>In any way that violates any applicable national or international law or regulation.</li>
          <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
          <li>To generate or disseminate verifiably false information and/or content with the purpose of harming others.</li>
          <li>To generate or disseminate personal identifiable information that can be used to harm an individual.</li>
          <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.</li>
        </ul>

        <h2>4. Intellectual Property</h2>
        <p>The Service and its original content (excluding User Content), features and functionality are and will remain the exclusive property of Seedream Innovations Inc. and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.</p>

        <h2>5. Termination</h2>
        <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.</p>

        <h2>6. Limitation of Liability</h2>
        <p>In no event shall Seedream Innovations Inc., nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

        <h2>7. Changes to Terms</h2>
        <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>

        <h2>8. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at:</p>
        <p><strong>Email:</strong> <a href="mailto:legal@seedream.dev">legal@seedream.dev</a></p>
      </div>
    </>
  );
};

export default TermsOfServicePage;