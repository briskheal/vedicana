import React from 'react';

export const metadata = {
  title: 'Privacy Policy | VediCana',
  description: 'Privacy Policy and Data Protection guidelines for VediCana Organics in compliance with the DPDP Act 2023.',
};

export default function PrivacyPolicy() {
  return (
    <div className="bg-white min-h-screen py-16 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-500 mb-8 text-sm">Last updated: {new Date().toLocaleDateString('en-IN')}</p>

        <div className="prose prose-emerald max-w-none text-gray-700 space-y-6">
          <p>
            At VediCana Organics, your privacy is of utmost importance to us. This Privacy Policy outlines how we collect, use, and protect your personal data in compliance with the Digital Personal Data Protection (DPDP) Act, 2023 of India.
          </p>

          <h2 className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect information that you provide directly to us when you create an account, make a purchase, or communicate with us. This includes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Name, email address, and phone number</li>
            <li>Shipping and billing addresses</li>
            <li>Payment transaction details (we do not store full credit card numbers)</li>
            <li>Purchase history and preferences</li>
          </ul>

          <h2 className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use your personal data for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To process and fulfill your orders</li>
            <li>To communicate with you about your order status via Email, SMS, or WhatsApp</li>
            <li>To provide customer support</li>
            <li>To send promotional offers and updates (only with your explicit consent)</li>
            <li>To improve our website and services</li>
          </ul>

          <h2 className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4">3. Data Sharing and Third Parties</h2>
          <p>We do not sell your personal data. We may share necessary information with trusted third parties solely for the purpose of providing our services:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Courier and logistics partners (e.g., for shipping your order)</li>
            <li>Payment gateways (e.g., Razorpay) for secure transaction processing</li>
            <li>IT and marketing service providers under strict confidentiality agreements</li>
          </ul>

          <h2 className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4">4. Your Rights Under DPDP Act 2023</h2>
          <p>As an Indian resident, you have specific rights regarding your personal data:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Right to Access:</strong> You can request a copy of the personal data we hold about you.</li>
            <li><strong>Right to Correction:</strong> You can update or correct inaccurate data in your profile.</li>
            <li><strong>Right to Erasure:</strong> You can request the deletion of your personal data when it is no longer necessary for the purpose it was collected.</li>
            <li><strong>Right to Withdraw Consent:</strong> You can withdraw consent for marketing communications at any time.</li>
          </ul>

          <h2 className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4">5. Cookies</h2>
          <p>We use cookies to enhance your browsing experience. You can manage your cookie preferences through our cookie consent banner or your browser settings.</p>

          <h2 className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4">6. Contact Us</h2>
          <p>For any privacy-related queries or to exercise your rights, please contact our Data Protection Officer at:</p>
          <p className="font-semibold mt-2">Email: info@vedicana.com</p>
        </div>
      </div>
    </div>
  );
}
