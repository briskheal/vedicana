import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';

import models from '../../../models/index.js';
import { checkRateLimit } from '../../../lib/rateLimit.js';
import { verifyRecaptcha } from '../../../lib/recaptcha.js';

const { ContactMessage } = models;

// ── Zoho SMTP — port 465 SSL (587 is blocked on Vercel) ─────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.ZOHO_SMTP_HOST || 'smtp.zoho.in',
  port: parseInt(process.env.ZOHO_SMTP_PORT || '465', 10),
  secure: true,
  auth: {
    user: process.env.ZOHO_SMTP_USER || 'info@vedicana.com',
    pass: process.env.ZOHO_SMTP_PASS,
  },
});

// ── Email to admin (notify of new contact message) ───────────────────────────
function buildAdminEmail({ name, email, subject, message }) {
  const adminEmail = process.env.ZOHO_INFO_USER || process.env.ZOHO_SMTP_USER || 'info@vedicana.com';
  return {
    from: `"VediCana Website" <info@vedicana.com>`,
    to: adminEmail,   // send to info@
    replyTo: email,
    subject: `📬 New Contact: ${subject}`,
    html: `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
    <tr><td align="center">
      <table width="580" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#006d39,#008c4a);padding:28px 36px;">
          <h2 style="margin:0;color:#fff;font-size:20px;">📬 New Contact Form Submission</h2>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">vedicana.com/contact</p>
        </td></tr>
        <tr><td style="padding:32px 36px;">
          <table width="100%" style="margin-bottom:20px;">
            <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888;width:100px;">Name</td>
                <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#222;font-weight:600;">${name}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888;">Email</td>
                <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#006d39;"><a href="mailto:${email}" style="color:#006d39;">${email}</a></td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888;">Subject</td>
                <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#222;font-weight:600;">${subject}</td></tr>
          </table>
          <p style="font-size:13px;color:#888;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Message</p>
          <div style="background:#f9fdf8;border-left:4px solid #006d39;padding:16px 20px;border-radius:0 8px 8px 0;font-size:15px;color:#333;line-height:1.7;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
          <p style="margin:24px 0 0;font-size:12px;color:#bbb;">Reply directly to this email to respond to ${name}.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  };
}

// ── Auto-reply to visitor ─────────────────────────────────────────────────────
function buildAutoReply({ name, email, subject, companyEmail, companyAddress }) {
  const senderEmail = process.env.ZOHO_INFO_USER || process.env.ZOHO_SMTP_USER;
  return {
    from: `"VediCana Organics" <${senderEmail}>`,
    to: email,
    subject: '✅ We received your message — VediCana Organics',
    html: `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
    <tr><td align="center">
      <table width="580" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#006d39,#008c4a);padding:36px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;">VediCana</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:12px;letter-spacing:2px;">ORGANICS</p>
        </td></tr>
        <tr><td style="padding:36px;">
          <h2 style="margin:0 0 12px;color:#006d39;font-size:20px;">Thank you, ${name}! 🙏</h2>
          <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.7;">
            We've received your message regarding <strong>${subject}</strong> and our team will get back to you within <strong>24–48 hours</strong>.
          </p>
          <p style="margin:0 0 28px;color:#777;font-size:14px;line-height:1.7;">
            For urgent queries, you can reach us directly at:<br/>
            📧 <a href="mailto:${companyEmail}" style="color:#006d39;">${companyEmail}</a><br/>
            📍 ${companyAddress}
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="https://www.vedicana.com/shop" style="display:inline-block;background:#006d39;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 36px;border-radius:50px;">
                🛍️ Browse Our Products
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:20px 36px;text-align:center;border-top:1px solid #f0f0f0;">
          <p style="margin:0;font-size:12px;color:#bbb;">© 2025 VediCana Organics · Ayush & WHO GMP Certified · Pure Ayurveda</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  };
}

// ── Deep Bot Text Validation ───────────────────────────────────────────────────
const deepBotCheck = (data) => {
  const { name, email, message } = data;
  if (email && (email.toLowerCase() === 'bobbylarson1@yahoo.com' || email.toLowerCase().endsWith('.ru'))) {
    return { isSpam: true };
  }
  if (name && /[bcdfghjklmnpqrstvwxz]{5,}/i.test(name.replace(/\s/g, ''))) {
    return { isSpam: true };
  }
  if (message && /[bcdfghjklmnpqrstvwxz]{7,}/i.test(message)) {
    return { isSpam: true };
  }
  return { isSpam: false };
};

export async function POST(request) {
  try {
    // 1. Rate Limiting Check
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip, 3, 15 * 60 * 1000)) { // Max 3 requests per 15 minutes per IP
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { name, email, subject, message, bot_honeypot, recaptchaToken } = await request.json();

    if (bot_honeypot) {
      // Silent reject for spam bots
      return NextResponse.json({ success: true, message: 'Message sent!' }, { status: 200 });
    }

    // ── Deep Text Validation ──
    const botCheck = deepBotCheck({ name, email, message });
    if (botCheck.isSpam) {
      // Silent reject
      console.warn(`Spam bot caught by deep text check on Vedicana from ${ip}`);
      return NextResponse.json({ success: true, message: 'Your message has been sent! We will get back to you within 24–48 hours.' }, { status: 200 });
    }

    // 2. reCAPTCHA Verification (Strictly Required)
    if (!recaptchaToken) {
      console.warn(`Blocked request missing recaptcha token from ${ip}`);
      return NextResponse.json({ error: 'Security token missing. Please try again.' }, { status: 403 });
    }
    
    const isValidCaptcha = await verifyRecaptcha(recaptchaToken);
    if (!isValidCaptcha) {
      return NextResponse.json({ error: 'Security check failed. You appear to be a bot.' }, { status: 403 });
    }

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Please fill out all required fields.' }, { status: 400 });
    }

    // Save to database
    await ContactMessage.create({
      name,
      email,
      subject,
      message,
      status: 'Unread'
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    // Load settings from config to get company email and address
    let companyEmail = 'info@vedicana.com';
    let companyAddress = 'Vadodara, India';
    try {
      const settingsPath = path.join(process.cwd(), 'public', 'settings_config.json');
      const settingsData = await fs.readFile(settingsPath, 'utf8');
      const settings = JSON.parse(settingsData);
      companyEmail = settings.company_email || companyEmail;
      companyAddress = settings.company_address || companyAddress;
    } catch (err) {
      console.error('Failed to load settings_config.json for contact form:', err);
    }

    // Send both emails in parallel
    const [adminResult, autoReplyResult] = await Promise.allSettled([
      transporter.sendMail(buildAdminEmail({ name, email, subject, message })),
      transporter.sendMail(buildAutoReply({ name, email, subject, companyEmail, companyAddress })),
    ]);

    if (adminResult.status === 'rejected') {
      console.error('Admin email failed:', adminResult.reason?.message);
    }
    if (autoReplyResult.status === 'rejected') {
      console.error('Auto-reply failed:', autoReplyResult.reason?.message);
    }

    // If both fail, return error
    if (adminResult.status === 'rejected' && autoReplyResult.status === 'rejected') {
      return NextResponse.json({
        error: 'Email delivery failed. Please contact us directly at newsletter@vedicana.com',
        detail: adminResult.reason?.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent! We will get back to you within 24–48 hours.',
    }, { status: 200 });

  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
