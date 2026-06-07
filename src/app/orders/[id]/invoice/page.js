import React from 'react';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import models from '../../../../models/index.js';
import PrintInvoiceButton from '../../../../components/PrintInvoiceButton.js';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';

const { Order, OrderItem, Product, User } = models;

export const dynamic = 'force-dynamic';

export default async function InvoicePage({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // Fetch Order with products (including tax_rate) & customer relation details
  const dbOrder = await Order.findByPk(id, {
    include: [
      { model: User, attributes: ['name', 'email', 'address', 'phone'] },
      {
        model: OrderItem,
        include: [{ model: Product, attributes: ['title', 'price', 'slug', 'tax_rate'] }]
      }
    ]
  });

  if (!dbOrder) {
    notFound();
  }

  const order = dbOrder.get({ plain: true });

  // Count how many orders exist with id <= order.id to get the sequential index (excluding cancelled orders)
  const orderSeqNumber = await Order.count({
    where: {
      id: {
        [Op.lte]: order.id
      },
      status: {
        [Op.ne]: 'cancelled'
      }
    }
  });
  
  // Load organization settings config from JSON
  const configPath = path.join(process.cwd(), 'public/settings_config.json');
  let companySettings = {
    company_name: 'VediCana Organics',
    company_address: 'Plot No. 120, GIDC Industrial Estate, Makarpura, Vadodara - 390010, Gujarat, India',
    company_phone: '+91 94372 72884',
    company_email: 'support@vedicana.com',
    company_gst: '24AAAAA0000A1Z5',
    marketed_by: 'VediCana Wellness Pvt. Ltd.',
    marketing_office_addr: 'Vraj Raj Complex, Ambamata-Temple Road, Karelibaug, Vadodara-390018, Gujarat, India',
    invoice_prefix: 'INV-2026-',
    invoice_start_no: 1001
  };

  if (fs.existsSync(configPath)) {
    try {
      const data = fs.readFileSync(configPath, 'utf-8');
      companySettings = { ...companySettings, ...JSON.parse(data) };
    } catch (e) {
      console.error('Error reading settings config:', e);
    }
  }

  // Load brand logo exists status & logo height
  const logoPath = path.join(process.cwd(), 'public', 'logo.webp');
  const hasLogo = fs.existsSync(logoPath);

  const logoConfigPath = path.join(process.cwd(), 'public/logo_config.json');
  let logoHeight = 48; // default
  if (fs.existsSync(logoConfigPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(logoConfigPath, 'utf8'));
      if (config.height) {
        logoHeight = Number(config.height);
      }
    } catch (e) {
      console.error('Failed to parse logo height config:', e);
    }
  }
  
  // Format User database address if exists
  let userDbAddress = '';
  if (order.User?.address) {
    try {
      const parsedUserAddr = JSON.parse(order.User.address);
      if (parsedUserAddr && typeof parsedUserAddr === 'object') {
        userDbAddress = [
          parsedUserAddr.address,
          parsedUserAddr.city,
          parsedUserAddr.state,
          parsedUserAddr.pincode
        ].filter(Boolean).join(', ');
      } else {
        userDbAddress = order.User.address;
      }
    } catch {
      userDbAddress = order.User.address;
    }
  }

  // Parse Shipping and Billing Address Information
  let billing = {};
  let shipping = {};
  let rawShipping = {};
  try {
    rawShipping = JSON.parse(order.shippingAddress);
    
    // Billing Details
    billing = {
      name: `${rawShipping.billingFirstName || ''} ${rawShipping.billingLastName || ''}`.trim() || order.User?.name || 'Valued Customer',
      company: rawShipping.billingCompanyName || '',
      address: rawShipping.billingAddress || userDbAddress || 'N/A',
      city: rawShipping.billingCity || '',
      state: rawShipping.billingState || 'Odisha',
      pincode: rawShipping.billingPincode || '',
      phone: rawShipping.billingPhone || order.User?.phone || 'N/A',
      email: rawShipping.billingEmail || order.User?.email || 'N/A'
    };

    // Shipping Details
    if (rawShipping.shipToDifferentAddress) {
      shipping = {
        name: `${rawShipping.shippingFirstName || ''} ${rawShipping.shippingLastName || ''}`.trim() || billing.name,
        company: rawShipping.shippingCompanyName || '',
        address: rawShipping.shippingAddress || billing.address,
        city: rawShipping.shippingCity || billing.city,
        state: rawShipping.shippingState || billing.state,
        pincode: rawShipping.shippingPincode || billing.pincode,
        phone: rawShipping.shippingPhone || billing.phone,
        email: billing.email
      };
    } else {
      shipping = { ...billing };
    }
  } catch (err) {
    console.error('Error parsing shipping details JSON, falling back to legacy/user database fields:', err);
    billing = {
      name: order.User?.name || 'Valued Customer',
      address: userDbAddress || order.shippingAddress || 'N/A',
      city: '',
      state: 'Odisha',
      pincode: '',
      phone: order.User?.phone || 'N/A',
      email: order.User?.email || 'N/A'
    };
    shipping = {
      name: order.User?.name || 'Valued Customer',
      address: order.shippingAddress || userDbAddress || 'N/A',
      city: '',
      state: 'Odisha',
      pincode: '',
      phone: order.User?.phone || 'N/A',
      email: order.User?.email || 'N/A'
    };
  }

  const billingState = (shipping.state || 'Odisha').trim();
  const isIntraState = billingState.toLowerCase() === 'odisha';

  const discount = parseFloat(order.discountAmount || 0);
  const netPaidTotal = parseFloat(order.totalAmount || 0);

  // Calculate Order raw subtotal inclusive of GST
  const rawSubtotal = (order.OrderItems || []).reduce((acc, item) => {
    return acc + (parseFloat(item.price) * parseInt(item.quantity, 10));
  }, 0);

  // Backtrack Shipping Charges
  const shippingFee = Math.max(0, Math.round(netPaidTotal - (rawSubtotal - discount)));

  let totalTaxableValue = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;
  let totalTaxAmount = 0;

  // Map and calculate taxes net of proportional discounts
  const invoiceItems = (order.OrderItems || []).map(item => {
    const qty = parseInt(item.quantity, 10);
    const unitPriceInclusive = parseFloat(item.price);
    const subtotalInclusive = unitPriceInclusive * qty;
    
    // Proportional share of the coupon discount
    const itemDiscountShare = rawSubtotal > 0 ? (subtotalInclusive / rawSubtotal) * discount : 0;
    const netItemSubtotalInclusive = subtotalInclusive - itemDiscountShare;

    // Custom tax rate from database, defaults to 5
    const itemTaxRate = item.Product?.tax_rate ?? 5;
    
    // Reverse tax calculation from net inclusive paid price
    const taxableValue = netItemSubtotalInclusive / (1 + itemTaxRate / 100);
    const taxAmount = netItemSubtotalInclusive - taxableValue;

    totalTaxableValue += taxableValue;
    totalTaxAmount += taxAmount;

    let cgst = 0, sgst = 0, igst = 0;
    if (isIntraState) {
      cgst = taxAmount / 2;
      sgst = taxAmount / 2;
      totalCGST += cgst;
      totalSGST += sgst;
    } else {
      igst = taxAmount;
      totalIGST += igst;
    }

    return {
      title: item.variant 
        ? `${item.Product?.title || 'Organic Ayurvedic Formulation'} (${item.variant})`
        : (item.Product?.title || 'Organic Ayurvedic Formulation'),
      hsn: '30049011', // Standard HSN code for Ayurvedic preparations
      qty,
      unitPriceInclusive,
      taxableValue,
      taxAmount,
      taxRate: itemTaxRate,
      cgst,
      sgst,
      igst,
      subtotalInclusive,
      netItemSubtotalInclusive
    };
  });

  const merchantName = encodeURIComponent(companySettings.bank_account_name || companySettings.company_name);
  const upiUrl = `upi://pay?pa=${companySettings.bank_upi_id || ''}&pn=${merchantName}&am=${netPaidTotal.toFixed(2)}&cu=INR&tn=Order_${order.id}`;
  
  // Decide which QR code image to show
  const showQr = companySettings.bank_show_qr !== false && companySettings.bank_upi_id;
  const isStaticQr = companySettings.bank_qr_type === 'static' && companySettings.bank_static_qr_image;
  const qrImageSrc = isStaticQr 
    ? companySettings.bank_static_qr_image 
    : `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(upiUrl)}`;

  // Determine helper text based on configured branding option
  let qrBrandingText = 'Scan with GPay / PhonePe / Paytm / BHIM';
  if (companySettings.bank_upi_provider === 'gpay') {
    qrBrandingText = 'Scan with Google Pay';
  } else if (companySettings.bank_upi_provider === 'phonepe') {
    qrBrandingText = 'Scan with PhonePe';
  } else if (companySettings.bank_upi_provider === 'paytm') {
    qrBrandingText = 'Scan with Paytm';
  } else if (companySettings.bank_upi_provider === 'none') {
    qrBrandingText = 'Scan to Pay via UPI';
  }

  return (
    <div className="bg-[#f1f5f9] min-h-screen py-2 print:bg-white print:py-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm 8mm;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Completely hide any outer card borders */
          .print-card {
            border: none !important;
            border-width: 0 !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          /* Make all internal borders light gray to strip green borders */
          tr, td, th, div, table {
            border-color: #e2e8f0 !important;
          }
          /* Scale logo for print */
          .print-logo {
            height: 40px !important;
            width: auto !important;
          }
          /* Ensure everything fits on a single page */
          .print-single-page {
            page-break-inside: avoid !important;
          }
        }
      `}} />
      
      {/* Floating Action Header Toolbar */}
      <div className="max-w-4xl mx-auto mb-2 px-4 flex justify-between items-center print:hidden">
        <a 
          href="/admin/orders" 
          className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-1.5 rounded-lg font-medium text-xs border border-slate-700 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Orders
        </a>
        
        <PrintInvoiceButton />
      </div>

      {/* Main Print Layout Wrapper */}
      <div className="max-w-4xl mx-auto bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 print-card print:shadow-none print:border-0 print:border-none print:p-0 print-single-page">
        
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-150 pb-2.5 print:pb-1.5 print:gap-1">
          <div>
            {hasLogo ? (
              <img 
                src="/logo.webp" 
                alt={companySettings.company_name} 
                style={{ height: `${logoHeight}px` }} 
                className="w-auto object-contain max-h-[64px] mb-1 print-logo print:max-h-[40px]"
              />
            ) : (
              <h1 className="text-2xl font-serif text-vedicana-green font-bold tracking-tight print:text-lg">
                {companySettings.company_name}
              </h1>
            )}
            <div className="text-[11px] text-gray-500 mt-1 space-y-0.5 leading-tight font-sans print:text-[10px] print:space-y-0">
              <p>Corporate Office: {companySettings.company_address}</p>
              {companySettings.marketed_by && (
                <p><span className="font-semibold text-gray-700">Marketed By:</span> {companySettings.marketed_by}</p>
              )}
              {companySettings.marketing_office_addr && (
                <p><span className="font-semibold text-gray-700">Marketing Office:</span> {companySettings.marketing_office_addr}</p>
              )}
              <p>Email: {companySettings.company_email} | Phone: {companySettings.company_phone}</p>
              {companySettings.company_gst && (
                <p className="font-semibold text-gray-700 mt-0.5">GSTIN: {companySettings.company_gst} (Tax Invoice)</p>
              )}
            </div>
          </div>
          
          <div className="text-left sm:text-right font-sans print:text-[10px]">
            <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide print:text-sm print:mb-0.5">TAX INVOICE</h2>
            <div className="text-xs mt-1 space-y-0.5 print:text-[10px] print:space-y-0 print:mt-0">
              <p className="text-gray-500">Invoice Number: <span className="font-mono text-gray-800 font-bold">{companySettings.invoice_prefix || 'INV-2026-'}{(() => {
                const startNo = companySettings.invoice_start_no !== undefined ? Number(companySettings.invoice_start_no) : 1001;
                return startNo === 0 ? orderSeqNumber : startNo + orderSeqNumber - 1;
              })()}</span></p>
              <p className="text-gray-500">Invoice Date: <span className="text-gray-800">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></p>
              <p className="text-gray-500">Place of Supply: <span className="text-gray-800 font-semibold">{billingState}</span></p>
              <p className="text-gray-500">Payment Status: <span className={`uppercase font-bold text-[10px] ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>{order.paymentStatus}</span></p>
            </div>
          </div>
        </div>

        {/* Billing & Shipping Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-4 py-2.5 print:py-1.5 print:gap-2 border-b border-gray-150 font-sans print:text-[10px]">
          <div>
            <h3 className="text-[10px] print:text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-1">Billing Address</h3>
            <p className="font-bold text-gray-800 text-xs">{billing.name}</p>
            {billing.company && <p className="text-[10px] text-gray-500 font-semibold leading-tight">Company: {billing.company}</p>}
            <p className="text-[11px] text-gray-600 mt-0.5 leading-tight">{billing.address || 'N/A'}</p>
            {billing.city && <p className="text-[11px] text-gray-600 mt-0.5">{billing.city}, {billing.state} - {billing.pincode}</p>}
            <p className="text-[11px] text-gray-700 mt-1 font-semibold">Phone: {billing.phone}</p>
            <p className="text-[9px] text-gray-500 font-light">Email: {billing.email}</p>
          </div>

          <div>
            <h3 className="text-[10px] print:text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-1">Shipping Address</h3>
            <p className="font-bold text-gray-800 text-xs">{shipping.name}</p>
            {shipping.company && <p className="text-[10px] text-gray-500 font-semibold leading-tight">Company: {shipping.company}</p>}
            <p className="text-[11px] text-gray-600 mt-0.5 leading-tight">{shipping.address || 'N/A'}</p>
            {shipping.city && <p className="text-[11px] text-gray-600 mt-0.5">{shipping.city}, {shipping.state} - {shipping.pincode}</p>}
            <p className="text-[11px] text-gray-700 mt-1 font-semibold">Phone: {shipping.phone}</p>
          </div>
          
          <div className="bg-gray-50/50 p-3 print:p-2 rounded-lg border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] print:text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-1">Checkout Method</h3>
              <p className="text-xs font-semibold text-gray-800 capitalize">{order.paymentMethod === 'razorpay' ? 'Razorpay Gateway (Prepaid)' : 'Cash on Delivery (COD)'}</p>
              {order.paymentId && (
                <p className="text-[9px] text-gray-500 font-mono mt-0.5">Txn ID: {order.paymentId}</p>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 text-[11px] print:text-[9px] text-emerald-700 border-t border-gray-100 pt-1.5 print:pt-1 mt-1.5 print:mt-1">
              <ShieldCheck size={12} />
              <span>Ayush Standard Certified Ayurvedic Supply</span>
            </div>
          </div>
        </div>

        {/* Invoice Item Table */}
        <div className="py-2.5 print:py-1.5 font-sans">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-emerald-50/60 border-b border-emerald-100/80 text-emerald-800 font-bold uppercase tracking-wider text-[9px]">
                <th className="py-2 px-2 w-1/3 rounded-l-lg">Item Description</th>
                <th className="py-2 px-1 text-center font-semibold">HSN</th>
                <th className="py-2 px-1 text-center font-semibold">Qty</th>
                <th className="py-2 px-1 text-right font-semibold">Taxable Value</th>
                <th className="py-2 px-1 text-right font-semibold">GST Rate</th>
                {isIntraState ? (
                  <>
                    <th className="py-2 px-1 text-right font-semibold">CGST</th>
                    <th className="py-2 px-1 text-right font-semibold">SGST</th>
                  </>
                ) : (
                  <th className="py-2 px-1 text-right font-semibold">IGST</th>
                )}
                <th className="py-2 px-2 text-right font-semibold rounded-r-lg">Total Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {invoiceItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                  <td className="py-2 px-2 print:py-1">
                    <p className="font-semibold text-gray-900 text-xs print:text-[10px] leading-snug">{item.title}</p>
                    {discount > 0 && (
                      <span className="text-[8px] text-gray-450 block font-normal leading-none mt-0.5">MRP: ₹{item.unitPriceInclusive.toFixed(2)} (coupon discounted)</span>
                    )}
                  </td>
                  <td className="py-2 px-1 print:py-1 text-center font-mono">{item.hsn}</td>
                  <td className="py-2 px-1 print:py-1 text-center font-mono">{item.qty}</td>
                  <td className="py-2 px-1 print:py-1 text-right font-mono">₹{item.taxableValue.toFixed(2)}</td>
                  <td className="py-2 px-1 print:py-1 text-right font-mono">{item.taxRate}%</td>
                  {isIntraState ? (
                    <>
                      <td className="py-2 px-1 print:py-1 text-right font-mono text-gray-500">
                        ₹{item.cgst.toFixed(2)}
                        <span className="text-[8px] print:text-[7px] text-gray-400 block font-sans leading-none">({item.taxRate / 2}%)</span>
                      </td>
                      <td className="py-2 px-1 print:py-1 text-right font-mono text-gray-500">
                        ₹{item.sgst.toFixed(2)}
                        <span className="text-[8px] print:text-[7px] text-gray-400 block font-sans leading-none">({item.taxRate / 2}%)</span>
                      </td>
                    </>
                  ) : (
                    <td className="py-2 px-1 print:py-1 text-right font-mono text-gray-500">
                      ₹{item.igst.toFixed(2)}
                      <span className="text-[8px] print:text-[7px] text-gray-400 block font-sans leading-none">({item.taxRate}%)</span>
                    </td>
                  )}
                  <td className="py-2 px-2 print:py-1 text-right font-mono font-bold text-gray-900">₹{item.netItemSubtotalInclusive.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-3 border-t border-gray-150 pt-2.5 print:pt-1.5 font-sans">
          
          {/* Left Column: Tax & Banking */}
          <div className="space-y-2">
            {/* GST breakdown summary */}
            <div className="bg-gray-50/50 p-2.5 print:p-1.5 rounded-lg border border-gray-100/60 text-[10px] print:text-[9px] space-y-1 print:space-y-0.5">
              <h4 className="text-[9px] print:text-[8px] font-bold text-gray-400 uppercase tracking-wider">GST Tax Summary Breakdown</h4>
              <div className="text-[11px] print:text-[10px] space-y-0.5 font-mono text-gray-600">
                <div className="flex justify-between">
                  <span>Total Taxable Amount:</span>
                  <span>₹{totalTaxableValue.toFixed(2)}</span>
                </div>
                {isIntraState ? (
                  <>
                    <div className="flex justify-between">
                      <span>Central GST (CGST):</span>
                      <span>₹{totalCGST.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State GST (SGST):</span>
                      <span>₹{totalSGST.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span>Integrated GST (IGST):</span>
                    <span>₹{totalIGST.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-100 pt-0.5 text-gray-700 font-bold">
                  <span>Total Tax Collected:</span>
                  <span>₹{totalTaxAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Banking Details & UPI QR Code */}
            {companySettings.bank_upi_id && showQr && (
              <div className="bg-gray-50/50 p-2 print:p-1.5 rounded-lg border border-gray-100/60 flex items-center justify-between gap-2">
                <div className="text-[9px] space-y-0.5">
                  <h4 className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Bank Payment Details</h4>
                  <p className="text-gray-750"><span className="font-semibold text-gray-500">Bank:</span> {companySettings.bank_name}</p>
                  <p className="text-gray-755"><span className="font-semibold text-gray-500">A/C Name:</span> {companySettings.bank_account_name}</p>
                  <p className="text-gray-755 font-mono"><span className="font-semibold text-gray-500 font-sans">A/C No:</span> {companySettings.bank_account_no}</p>
                  <p className="text-gray-755 font-mono"><span className="font-semibold text-gray-500 font-sans">IFSC:</span> {companySettings.bank_ifsc}</p>
                  <p className="text-gray-750"><span className="font-semibold text-gray-500">UPI ID:</span> <span className="font-mono">{companySettings.bank_upi_id}</span></p>
                </div>
                
                <div className="flex flex-col items-center gap-0.5 bg-white p-1 rounded-md border border-gray-100">
                  <img src={qrImageSrc} alt="Payment QR Code" className="w-[72px] h-[72px] print:w-[54px] print:h-[54px] object-contain" />
                  <span className="text-[6px] print:text-[5px] font-bold text-slate-500 tracking-wider uppercase">{qrBrandingText}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Checkout Totals */}
          <div className="flex flex-col items-end justify-between space-y-1.5 print:space-y-1 text-xs print:text-[10px]">
            <div className="w-full flex flex-col items-end space-y-1.5 print:space-y-1">
              <div className="w-full flex justify-between max-w-[240px] text-gray-500">
                <span>Subtotal (MRP Incl. GST):</span>
                <span className="font-mono text-gray-800 font-medium">₹{rawSubtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="w-full flex justify-between max-w-[240px] text-emerald-600 font-medium">
                  <span>Discount Applied ({order.couponCode || 'Promo'}):</span>
                  <span className="font-mono">- ₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="w-full flex justify-between max-w-[240px] text-gray-500">
                <span>Shipping Charges:</span>
                <span className="font-mono text-gray-800 font-medium">
                  {shippingFee > 0 ? `₹${shippingFee.toFixed(2)}` : 'Free'}
                </span>
              </div>
              <div className="w-full flex justify-between max-w-[240px] border-t border-gray-150 pt-1.5 print:pt-1 text-sm print:text-xs font-bold text-gray-900 leading-none">
                <span>Grand Total:</span>
                <span className="font-mono text-vedicana-green text-base print:text-sm">₹{netPaidTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Terms and Conditions block */}
            {companySettings.terms_conditions && (
              <div className="w-full max-w-[240px] mt-2.5 print:mt-1.5 text-left border border-gray-100 bg-gray-50/50 p-2 print:p-1.5 rounded-lg text-[8px] sm:text-[9px] print:text-[7.5px] text-gray-500 leading-normal">
                <p className="font-bold text-gray-400 uppercase tracking-wider mb-1 text-[8px]">Terms & Conditions</p>
                <div className="whitespace-pre-line font-sans text-gray-600">
                  {companySettings.terms_conditions}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer Notes */}
        <div className="border-t border-gray-150 pt-2.5 print:pt-1.5 mt-4 print:mt-2.5 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-3 text-[9px] print:text-[8px] font-sans">
          <div className="text-center sm:text-left text-gray-450 leading-relaxed space-y-0.5 max-w-[480px]">
            <p className="font-semibold text-gray-500">Thank you for supporting organic wellness with VediCana Organics.</p>
            <p>This is a computer-generated Tax Invoice and does not require a physical signature.</p>
          </div>
          {companySettings.authorized_signature && (
            <div className="text-center sm:text-right flex flex-col items-center sm:items-end space-y-0.5 print:space-y-0">
              <span className="text-[7.5px] text-gray-400 font-bold uppercase tracking-wider">For {companySettings.company_name}</span>
              <img 
                src={companySettings.authorized_signature} 
                alt="Authorized Signature" 
                className="h-[32px] print:h-[26px] w-auto object-contain mix-blend-multiply" 
              />
              <span className="text-[8.5px] text-gray-700 font-bold border-t border-gray-100 pt-0.5 block">Authorized Signatory</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
