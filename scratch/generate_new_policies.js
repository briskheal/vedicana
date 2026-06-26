import { config } from 'dotenv';
config();
import DiscoverPage from '../src/models/DiscoverPage.js';

const generatePolicies = async () => {
  const policies = [
    {
      slug: 'payment-security',
      title: 'Payment Security',
      content: `
        <h2 class="text-2xl font-serif text-vedicana-dark-green mt-8 mb-4">Secure Transactions at VediCana</h2>
        <p class="text-gray-700 leading-relaxed mb-4">At VediCana Organics, your financial security is our highest priority. We utilize state-of-the-art encryption and security protocols to ensure that every transaction you make is 100% safe.</p>
        
        <h3 class="text-xl font-serif text-gray-800 mt-6 mb-3">1. SSL Encryption</h3>
        <p class="text-gray-700 leading-relaxed mb-4">Our entire website, including the checkout process, is secured with 256-bit Secure Sockets Layer (SSL) encryption. This means your personal and payment details are encrypted before being transmitted over the internet.</p>
        
        <h3 class="text-xl font-serif text-gray-800 mt-6 mb-3">2. Trusted Payment Gateways</h3>
        <p class="text-gray-700 leading-relaxed mb-4">We partner with India's leading payment processors (such as Razorpay and PayU) which are PCI-DSS compliant. We do not store any of your credit card, debit card, or net banking credentials on our servers.</p>
        
        <h3 class="text-xl font-serif text-gray-800 mt-6 mb-3">3. Fraud Prevention</h3>
        <p class="text-gray-700 leading-relaxed mb-4">Our payment partners employ advanced fraud-detection algorithms to monitor transactions 24/7. In the event of suspicious activity, you may be required to verify your identity through OTP (One Time Password) via your bank.</p>
      `
    },
    {
      slug: 'pricing-policy',
      title: 'Pricing Policy',
      content: `
        <h2 class="text-2xl font-serif text-vedicana-dark-green mt-8 mb-4">Transparent Pricing for Pure Ayurveda</h2>
        <p class="text-gray-700 leading-relaxed mb-4">VediCana Organics believes in offering premium, authentic Ayurvedic formulations at fair and transparent prices. All our pricing is carefully calculated based on the purity of raw materials and ethical sourcing practices.</p>
        
        <h3 class="text-xl font-serif text-gray-800 mt-6 mb-3">1. Maximum Retail Price (MRP)</h3>
        <p class="text-gray-700 leading-relaxed mb-4">All prices listed on our website are inclusive of all applicable taxes (GST) unless explicitly stated otherwise. The final price at checkout is the exact amount you will be charged.</p>
        
        <h3 class="text-xl font-serif text-gray-800 mt-6 mb-3">2. Price Changes</h3>
        <p class="text-gray-700 leading-relaxed mb-4">Prices of our natural products may fluctuate occasionally due to agricultural yields, seasonal changes, and raw material availability. However, the price you see at the time of placing your order will always be the price honored.</p>
        
        <h3 class="text-xl font-serif text-gray-800 mt-6 mb-3">3. Discounts and Promotions</h3>
        <p class="text-gray-700 leading-relaxed mb-4">Promotional offers, coupon codes, and discounts are subject to specific terms and cannot be combined unless explicitly stated. VediCana reserves the right to modify or withdraw promotional pricing at any time without prior notice.</p>
      `
    },
    {
      slug: 'cancelation-policy',
      title: 'Cancelation Policy',
      content: `
        <h2 class="text-2xl font-serif text-vedicana-dark-green mt-8 mb-4">Order Cancelation Terms</h2>
        <p class="text-gray-700 leading-relaxed mb-4">We process orders quickly to ensure fast delivery. If you need to cancel your order, please follow the guidelines below:</p>
        
        <h3 class="text-xl font-serif text-gray-800 mt-6 mb-3">1. Cancelation Before Dispatch</h3>
        <p class="text-gray-700 leading-relaxed mb-4">You may cancel your order free of charge at any time before it is dispatched from our warehouse. Simply navigate to your Profile Dashboard, select the order, and click "Cancel". A full refund will be initiated immediately.</p>
        
        <h3 class="text-xl font-serif text-gray-800 mt-6 mb-3">2. Cancelation After Dispatch</h3>
        <p class="text-gray-700 leading-relaxed mb-4">Once an order has been handed over to our courier partners, it cannot be directly canceled. You may, however, refuse the delivery at your doorstep. Once the package is returned to our facility, a refund will be processed (shipping charges may be deducted).</p>
        
        <h3 class="text-xl font-serif text-gray-800 mt-6 mb-3">3. VediCana Initiated Cancelations</h3>
        <p class="text-gray-700 leading-relaxed mb-4">VediCana reserves the right to cancel any order due to inventory shortages, pricing errors, or suspected fraudulent activity. In such cases, you will be notified immediately and fully refunded.</p>
      `
    },
    {
      slug: 'shipping-policy',
      title: 'Shipping Policy',
      content: `
        <h2 class="text-2xl font-serif text-vedicana-dark-green mt-8 mb-4">Shipping and Delivery Information</h2>
        <p class="text-gray-700 leading-relaxed mb-4">We deliver authentic Ayurvedic wellness to doorsteps across India. Our shipping policies are designed for transparency and speed.</p>
        
        <h3 class="text-xl font-serif text-gray-800 mt-6 mb-3">1. Processing Time</h3>
        <p class="text-gray-700 leading-relaxed mb-4">All orders are processed within 24-48 business hours. Orders are not shipped or delivered on weekends or public holidays.</p>
        
        <h3 class="text-xl font-serif text-gray-800 mt-6 mb-3">2. Shipping Rates & Estimates</h3>
        <p class="text-gray-700 leading-relaxed mb-4">Shipping charges for your order will be calculated and displayed at checkout. We currently offer free shipping on all orders above ₹999.</p>
        <ul class="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Standard Delivery:</strong> 3-5 business days.</li>
            <li><strong>Express Delivery:</strong> 1-2 business days (available in select pin codes).</li>
        </ul>
        
        <h3 class="text-xl font-serif text-gray-800 mt-6 mb-3">3. Shipment Tracking</h3>
        <p class="text-gray-700 leading-relaxed mb-4">Once your order ships, you will receive an email and SMS containing your AWB tracking number and a link to track your package in real-time.</p>
      `
    },
    {
      slug: 'return-policy',
      title: 'Returns & Refund Policy',
      content: `
        <h2 class="text-2xl font-serif text-vedicana-dark-green mt-8 mb-4">7-Day Return Guarantee</h2>
        <p class="text-gray-700 leading-relaxed mb-4">At VediCana Organics, we stand behind the quality of our Ayurvedic products. If you are not entirely satisfied, we're here to help.</p>
        
        <h3 class="text-xl font-serif text-gray-800 mt-6 mb-3">1. Eligibility for Returns</h3>
        <p class="text-gray-700 leading-relaxed mb-4">You have 7 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused, sealed, and in the same condition that you received it. It must also be in the original packaging.</p>
        
        <h3 class="text-xl font-serif text-gray-800 mt-6 mb-3">2. Damaged or Defective Items</h3>
        <p class="text-gray-700 leading-relaxed mb-4">If you receive a damaged, defective, or incorrect product, please contact us at info@vedicana.com within 48 hours with photographs of the product and packaging. We will arrange a free replacement or full refund immediately.</p>
        
        <h3 class="text-xl font-serif text-gray-800 mt-6 mb-3">3. Refund Processing</h3>
        <p class="text-gray-700 leading-relaxed mb-4">Once we receive your item, we will inspect it and notify you of the status of your refund. If approved, we will initiate a refund to your original method of payment. You will receive the credit within 5-7 business days, depending on your card issuer's policies.</p>
      `
    },
    {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      content: `
        <h2 class="text-2xl font-serif text-vedicana-dark-green mt-8 mb-4">Digital Personal Data Protection</h2>
        <p class="text-gray-700 leading-relaxed mb-4">Your privacy is of utmost importance to us. This policy outlines how VediCana Organics collects, uses, and protects your personal data in strict compliance with the Digital Personal Data Protection (DPDP) Act, 2023 of India.</p>
        
        <h3 class="text-xl font-serif text-gray-800 mt-6 mb-3">1. Information We Collect</h3>
        <ul class="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Name, email address, and phone number</li>
            <li>Shipping and billing addresses</li>
            <li>Purchase history and Ayurvedic wellness preferences</li>
        </ul>
        
        <h3 class="text-xl font-serif text-gray-800 mt-6 mb-3">2. How We Use Your Information</h3>
        <p class="text-gray-700 leading-relaxed mb-4">We use your data solely to process orders, communicate delivery updates via Email/SMS, provide customer support, and improve our services. We do not sell your personal data to any third-party marketing firms.</p>
        
        <h3 class="text-xl font-serif text-gray-800 mt-6 mb-3">3. Your Data Rights</h3>
        <p class="text-gray-700 leading-relaxed mb-4">Under the DPDP Act, you have the right to request access to your data, correct inaccuracies, withdraw marketing consent, or request complete erasure of your profile. To exercise these rights, please contact our Data Protection Officer at info@vedicana.com.</p>
      `
    },
    {
      slug: 'terms-and-conditions',
      title: 'Terms and Conditions',
      content: `
        <h2 class="text-2xl font-serif text-vedicana-dark-green mt-8 mb-4">Terms of Service</h2>
        <p class="text-gray-700 leading-relaxed mb-4">Welcome to VediCana Organics. By accessing or using our website, you agree to be bound by these Terms and Conditions.</p>
        
        <h3 class="text-xl font-serif text-gray-800 mt-6 mb-3">1. Medical Disclaimer</h3>
        <p class="text-gray-700 leading-relaxed mb-4">The products and information provided on this website are based on traditional Ayurvedic principles. They are not intended to diagnose, treat, cure, or prevent any severe medical disease. Always consult with a qualified healthcare provider before beginning any new wellness regimen, especially if you are pregnant, nursing, or have a pre-existing medical condition.</p>
        
        <h3 class="text-xl font-serif text-gray-800 mt-6 mb-3">2. Intellectual Property</h3>
        <p class="text-gray-700 leading-relaxed mb-4">All content on this site, including text, graphics, logos, and images, is the property of VediCana Organics and protected by Indian and international copyright laws.</p>
        
        <h3 class="text-xl font-serif text-gray-800 mt-6 mb-3">3. Limitation of Liability</h3>
        <p class="text-gray-700 leading-relaxed mb-4">VediCana Organics shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our products or website.</p>
      `
    }
  ];

  try {
    for (const page of policies) {
      const [dbPage, created] = await DiscoverPage.findOrCreate({
        where: { slug: page.slug },
        defaults: {
          title: page.title,
          content: page.content,
          is_active: true
        }
      });

      if (!created) {
        await DiscoverPage.update(
          { title: page.title, content: page.content, is_active: true },
          { where: { slug: page.slug } }
        );
      }
    }
    console.log('All 7 policies successfully injected into Supabase!');
    process.exit(0);
  } catch (err) {
    console.error('Error injecting policies:', err);
    process.exit(1);
  }
};

generatePolicies();
