import React from 'react';

export const metadata = {
  title: 'Terms & Conditions | VediCana',
  description: 'Terms and Conditions for using VediCana Organics website and services.',
};

export default function TermsAndConditions() {
  return (
    <div className="bg-white min-h-screen py-16 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">Terms & Conditions</h1>
        <p className="text-gray-500 mb-8 text-sm">Last updated: {new Date().toLocaleDateString('en-IN')}</p>

        <div className="prose prose-emerald max-w-none text-gray-700 space-y-6">
          <p>
            Welcome to VediCana Organics. By accessing and using our website (www.vedicana.com), you agree to comply with and be bound by the following terms and conditions.
          </p>

          <h2 className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4">1. Use of the Website</h2>
          <p>
            You must be at least 18 years of age to make a purchase on our website. You agree to provide accurate and current information when creating an account or making a purchase.
          </p>

          <h2 className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4">2. Product Information and Medical Disclaimer</h2>
          <p>
            The information provided on our website is for educational purposes only. Our Ayurvedic and herbal products are not intended to diagnose, treat, cure, or prevent any disease. Always consult with a qualified healthcare practitioner before starting any new dietary supplement, especially if you are pregnant, nursing, or have a pre-existing medical condition.
          </p>

          <h2 className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4">3. Pricing and Payments</h2>
          <p>
            All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes. We reserve the right to change prices at any time without prior notice. We accept payments via Cash on Delivery (COD), UPI, and Razorpay.
          </p>

          <h2 className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4">4. Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos, images, and software, is the property of VediCana Organics and is protected by Indian and international copyright laws. You may not reproduce, distribute, or create derivative works without our explicit written permission.
          </p>

          <h2 className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4">5. Limitation of Liability</h2>
          <p>
            VediCana Organics shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our products or website.
          </p>

          <h2 className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4">6. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in Vadodara, Gujarat.
          </p>

          <h2 className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4">7. Contact Information</h2>
          <p>If you have any questions about these Terms & Conditions, please contact us at:</p>
          <p className="font-semibold mt-2">Email: info@vedicana.com</p>
          <p className="font-semibold">Phone: +91 8249169354</p>
        </div>
      </div>
    </div>
  );
}
