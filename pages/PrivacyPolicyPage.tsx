import React from 'react';
import MetaTags from '../components/MetaTags';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      <MetaTags
        title="Privacy Policy | Seedream ImagenBrainAi 4.0"
        description="Read the Privacy Policy for Seedream ImagenBrainAi 4.0. Understand how we collect, use, and protect your data when you use our AI image generation services."
        canonicalPath="/privacy-policy"
      />
      <div className="max-w-4xl mx-auto prose prose-invert prose-headings:text-green-300 prose-a:text-green-300">
        <h1>Privacy Policy for Seedream ImagenBrainAi 4.0</h1>
        <p className="text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
        <p>Seedream Innovations Inc. ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services, Seedream ImagenBrainAi 4.0 (collectively, the "Service"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the service.</p>

        <h2>1. Information We Collect</h2>
        <p>We may collect information about you in a variety of ways. The information we may collect via the Service includes:</p>
        
        <h3>1.1. Personal Data</h3>
        <p>Personally identifiable information, such as your name, email address, and demographic information, that you voluntarily give to us when you register with the Service or when you choose to participate in various activities related to the Service.</p>
        
        <h4>1.2. Derivative Data</h4>
        <p>Information our servers automatically collect when you access the Service, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Service.</p>

        <h5>1.3. User Content</h5>
        <p>The text prompts you enter and the images you upload and generate ("User Content") are processed by our Service. We may store this data to improve our services and for content policy enforcement.</p>
        <h6>Anonymization of User Content</h6>
        <p>For the purpose of model training and service improvement, we may use your User Content in an anonymized and aggregated form. This means we remove any personally identifiable information from the prompts and data before analysis.</p>

        <h2>2. Use of Your Information</h2>
        <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:</p>
        <ul>
          <li>Create and manage your account.</li>
          <li>Provide, operate, and maintain our Service.</li>
          <li>Improve, personalize, and expand our Service.</li>
          <li>Understand and analyze how you use our Service.</li>
          <li>Develop new products, services, features, and functionality.</li>
          <li>Process your transactions and send you related information.</li>
          <li>Communicate with you, either directly or through one of our partners.</li>
          <li>Monitor and analyze usage and trends to improve your experience with the Service.</li>
          <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
        </ul>
        
        <h2>3. Disclosure of Your Information</h2>
        <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
        
        <h3>3.1. By Law or to Protect Rights</h3>
        <p>If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</p>
        
        <h4>3.2. Third-Party Service Providers</h4>
        <p>We may share your information with third parties that perform services for us or on our behalf, including data analysis, hosting services, customer service, and marketing assistance. This includes our AI model providers who process User Content to generate images.</p>
        
        <h2>4. Security of Your Information</h2>
        <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>
        
        <h2>5. Policy for Children</h2>
        <p>We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.</p>

        <h2>6. Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

        <h2>7. Contact Us</h2>
        <p>If you have questions or comments about this Privacy Policy, please contact us at:</p>
        <p><strong>Email:</strong> <a href="mailto:privacy@seedream.dev">privacy@seedream.dev</a></p>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;