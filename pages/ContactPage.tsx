import React from 'react';
import MetaTags from '../components/MetaTags';

const ContactPage: React.FC = () => {
  return (
    <>
      <MetaTags
        title="Contact Us | Seedream ImagenBrainAi 4.0"
        description="Contact the Seedream ImagenBrainAi 4.0 team for support, partnership inquiries, or press questions. We're here to help you on your creative journey."
        canonicalPath="/contact"
      />
      <div className="max-w-4xl mx-auto prose prose-invert prose-headings:text-green-300 prose-a:text-green-300">
        <h1>Contact Us</h1>
        <p className="text-xl">We're here to help and eager to hear from you! Whether you have a question about our features, a suggestion for improvement, a press inquiry, or just want to share your amazing creations, this is the place to do it. Your feedback is invaluable to us as we continue to build and refine Seedream ImagenBrainAi 4.0.</p>

        <h2>General Inquiries</h2>
        <p>For most questions, the quickest way to get an answer is to check our comprehensive FAQ section. If you can't find what you're looking for, please don't hesitate to reach out to our general support team. We aim to respond to all inquiries within 24-48 hours.</p>
        <p><strong>Email:</strong> <a href="mailto:support@seedream.dev">support@seedream.dev</a></p>

        <h3>Technical Support</h3>
        <p>Encountering a bug or a technical issue? Our dedicated technical support team is on standby to assist you. To help us resolve your issue as quickly as possible, please include the following information in your email:</p>
        <ul>
          <li>Your username or account email.</li>
          <li>A detailed description of the problem.</li>
          <li>The steps you took that led to the issue.</li>
          <li>Any error messages you received.</li>
          <li>Screenshots or a screen recording of the issue, if possible.</li>
        </ul>
        <p><strong>Email:</strong> <a href="mailto:techsupport@seedream.dev">techsupport@seedream.dev</a></p>
        
        <h4>API & Developer Support</h4>
        <p>If you are a developer using our API and have questions about integration, documentation, or endpoints, our developer relations team is here for you. We provide dedicated support to help you build amazing applications on top of our platform.</p>
        <h5>Integration Questions</h5>
        <p>For questions regarding SDKs, authentication, and best practices for integrating ImagenBrainAi 4.0 into your product.</p>
        <h6>Bug Reports</h6>
        <p>To report a bug or unexpected behavior in the API, please provide the request body, endpoint, and the response you received.</p>
        <p><strong>Email:</strong> <a href="mailto:developers@seedream.dev">developers@seedream.dev</a></p>

        <h2>Partnerships & Business Inquiries</h2>
        <p>We are always open to exploring collaboration and partnership opportunities. If you are interested in working with us, licensing our technology, or have other business-related proposals, please contact our business development team.</p>
        <p><strong>Email:</strong> <a href="mailto:partners@seedream.dev">partners@seedream.dev</a></p>

        <h2>Press & Media</h2>
        <p>For all media inquiries, including requests for interviews, press kits, or information about our company, please contact our communications team. We'd be happy to share our story with you.</p>
        <p><strong>Email:</strong> <a href="mailto:press@seedream.dev">press@seedream.dev</a></p>

        <h2>Mailing Address</h2>
        <p>If you need to reach us by postal mail, you can write to our headquarters at the following address. Please note that this is not the recommended method for support requests.</p>
        <p>
          Seedream Innovations Inc.<br />
          123 Creativity Lane<br />
          Tech City, CA 90210<br />
          United States
        </p>

        <h2>Connect on Social Media</h2>
        <p>Follow us on our social media channels to stay up-to-date with the latest news, feature releases, and community highlights. It's also a great way to connect with other creators.</p>
        <ul>
          <li><strong>Twitter:</strong> @SeedreamAI</li>
          <li><strong>Instagram:</strong> @Seedream.AI</li>
          <li><strong>Discord:</strong> <a href="#">discord.gg/seedream</a></li>
        </ul>
        <p>We look forward to hearing from you and seeing the incredible things you create with Seedream ImagenBrainAi 4.0!</p>
      </div>
    </>
  );
};

export default ContactPage;