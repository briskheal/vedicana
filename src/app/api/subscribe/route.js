import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import models from '../../../models/index.js';

const { Subscriber } = models;

// ── Zoho SMTP (Newsletter) ──────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 2525,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});

// ── Beautiful HTML thank-you email ──────────────────────────────────────────
function buildAutoReplyEmail(email) {
  return {
    from: `"VediCana Updates" <info@vedicana.com>`,
    to: email,
    subject: '🌿 Welcome to the VediCana Family!',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to VediCana</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f0;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f0;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#3d6b3b 0%,#5a9e57 60%,#8cc63f 100%);padding:48px 40px 36px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;letter-spacing:3px;color:rgba(255,255,255,0.75);text-transform:uppercase;">Pure • Ayurvedic • Organic</p>
              <h1 style="margin:0;font-size:34px;font-weight:700;color:#ffffff;letter-spacing:1px;">VediCana</h1>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8);letter-spacing:1px;">Organics</p>
            </td>
          </tr>

          <!-- Leaf divider -->
          <tr>
            <td style="background:linear-gradient(135deg,#3d6b3b,#8cc63f);height:4px;"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 40px 32px;">
              <h2 style="margin:0 0 16px;font-size:24px;color:#2d4a2b;font-weight:700;">
                🌿 You're In! Welcome to the Family.
              </h2>
              <p style="margin:0 0 20px;font-size:16px;color:#555;line-height:1.7;">
                Thank you for subscribing to the <strong style="color:#3d6b3b;">VediCana Newsletter</strong>. 
                We're thrilled to have you as part of our wellness community.
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#666;line-height:1.8;">
                As a subscriber, you'll be the <strong>first to know</strong> about:
              </p>

              <!-- Benefits grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
                <tr>
                  <td width="48%" style="background:#f0f7ef;border-radius:12px;padding:20px;vertical-align:top;">
                    <p style="margin:0 0 8px;font-size:22px;">🌱</p>
                    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#2d4a2b;">New Product Launches</p>
                    <p style="margin:0;font-size:13px;color:#777;">Exclusive early access to our latest Ayurvedic remedies.</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background:#f0f7ef;border-radius:12px;padding:20px;vertical-align:top;">
                    <p style="margin:0 0 8px;font-size:22px;">✨</p>
                    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#2d4a2b;">Special Offers</p>
                    <p style="margin:0;font-size:13px;color:#777;">Subscriber-only discounts and seasonal promotions.</p>
                  </td>
                </tr>
                <tr><td colspan="3" style="height:12px;"></td></tr>
                <tr>
                  <td width="48%" style="background:#f0f7ef;border-radius:12px;padding:20px;vertical-align:top;">
                    <p style="margin:0 0 8px;font-size:22px;">📖</p>
                    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#2d4a2b;">Wellness Tips</p>
                    <p style="margin:0;font-size:13px;color:#777;">Ancient Ayurvedic wisdom for modern healthy living.</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background:#f0f7ef;border-radius:12px;padding:20px;vertical-align:top;">
                    <p style="margin:0 0 8px;font-size:22px;">🏅</p>
                    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#2d4a2b;">Community Events</p>
                    <p style="margin:0;font-size:13px;color:#777;">Webinars, workshops, and wellness events near you.</p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://www.vedicana.com/shop"
                       style="display:inline-block;background:linear-gradient(135deg,#3d6b3b,#5a9e57);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:16px 40px;border-radius:50px;letter-spacing:0.5px;">
                      🛍️ Shop Our Remedies
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Quote banner -->
          <tr>
            <td style="background:#f9fdf8;border-top:1px solid #e8f4e6;border-bottom:1px solid #e8f4e6;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:14px;color:#5a9e57;font-style:italic;line-height:1.6;">
                "Let food be thy medicine, and medicine be thy food."<br/>
                <span style="font-style:normal;font-weight:600;color:#3d6b3b;">— Hippocrates</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#999;">
                You received this email because you subscribed at <a href="https://www.vedicana.com" style="color:#5a9e57;text-decoration:none;">vedicana.com</a>
              </p>
              <p style="margin:0;font-size:12px;color:#bbb;">
                © 2025 VediCana Organics. All rights reserved.<br/>
                Pure Ayurveda · WHO GMP Certified · 100% Natural
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  };
}

// ── API Route ────────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const { email } = await request.json();

    // 1. Validation
    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if already subscribed
    const existing = await Subscriber.findOne({ where: { email: normalizedEmail } });

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed to our newsletter!',
        }, { status: 200 });
      } else {
        // Reactivate subscription
        existing.is_active = true;
        await existing.save();

        // Send welcome-back email
        try {
          await transporter.sendMail({
            ...buildThankYouEmail(normalizedEmail),
            subject: '🌿 Welcome Back to VediCana!',
          });
          console.log(`✅ Welcome-back email sent to ${normalizedEmail}`);
        } catch (mailErr) {
          console.error('Welcome-back email error:', mailErr.message);
          // Still return success but include mail error for debugging
          return NextResponse.json({
            success: true,
            message: 'Welcome back! Your subscription has been reactivated.',
            mailError: mailErr.message,
          }, { status: 200 });
        }

        return NextResponse.json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.',
        }, { status: 200 });
      }
    }

    // 3. Create new subscriber
    await Subscriber.create({ email: normalizedEmail, is_active: true });

    // 4. Send thank-you email — await to catch errors
    try {
      await transporter.sendMail(buildAutoReplyEmail(normalizedEmail));
      console.log(`✅ Thank-you email sent to ${normalizedEmail}`);
    } catch (mailErr) {
      console.error('Thank-you email SMTP error:', mailErr.message);
      // Subscription succeeded, but return mail error for debugging
      return NextResponse.json({
        success: true,
        message: 'Thank you for subscribing to the VediCana newsletter!',
        mailError: mailErr.message,
      }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing to the VediCana newsletter!',
    }, { status: 201 });

  } catch (error) {
    console.error('Newsletter Subscribe Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to complete subscription' }, { status: 500 });
  }
}
