import React from 'react';

export const metadata = {
  title: 'Return Policy | VediCana',
  description: 'Return and Refund Policy for VediCana Organics.',
};

export default function ReturnPolicy() {
  return (
    <div className="bg-white min-h-screen py-16 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">Return & Refund Policy</h1>
        <p className="text-gray-500 mb-8 text-sm">Last updated: {new Date().toLocaleDateString('en-IN')}</p>

        <div className="prose prose-emerald max-w-none text-gray-700 space-y-6">
          <p>
            At VediCana Organics, we strive to ensure you receive the highest quality Ayurvedic and natural products. If you are not entirely satisfied with your purchase, we're here to help.
          </p>

          <h2 className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4">1. Return Window</h2>
          <p>
            You have <strong>7 calendar days</strong> to return an item from the date you received it.
          </p>

          <h2 className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4">2. Eligibility for Returns</h2>
          <p>To be eligible for a return, your item must meet the following criteria:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The item must be unused, unopened, and in the same condition that you received it.</li>
            <li>The item must be in the original packaging.</li>
            <li>You must have the receipt or proof of purchase.</li>
          </ul>
          <p className="text-red-600 text-sm italic mt-2">
            Note: Perishable goods such as honey, ghee, and certain oils cannot be returned once the seal is broken for hygiene and safety reasons.
          </p>

          <h2 className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4">3. How to Initiate a Return</h2>
          <p>
            You can initiate a return directly from your <a href="/profile" className="text-vedicana-green hover:underline">Profile Dashboard</a> under the "My Orders" tab if the order is within the 7-day window. Alternatively, you can contact our support team at info@vedicana.com with your Order ID and reason for return.
          </p>

          <h2 className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4">4. Refunds</h2>
          <p>
            Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>If your return is approved, we will initiate a refund to your original method of payment.</li>
            <li>You will receive the credit within a certain amount of days, depending on your card issuer's policies (typically 7–10 business days).</li>
            <li>For Cash on Delivery (COD) orders, our support team will contact you for your bank account or UPI details to process the refund.</li>
          </ul>

          <h2 className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4">5. Shipping Costs for Returns</h2>
          <p>
            You will be responsible for paying for your own shipping costs for returning your item, unless the return is due to a defect or an error on our part (e.g., you received the wrong item). Shipping costs are non-refundable.
          </p>

          <h2 className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4">6. Damaged or Defective Items</h2>
          <p>
            If you receive a damaged or defective item, please contact us immediately within 48 hours of delivery at info@vedicana.com with photos of the damaged product and packaging. We will arrange a replacement or full refund at no additional cost to you.
          </p>
        </div>
      </div>
    </div>
  );
}
