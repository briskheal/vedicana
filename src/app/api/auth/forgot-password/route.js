import { NextResponse } from 'next/server';
import User from '../../../../models/User.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_INFO_USER || process.env.ZOHO_SMTP_USER,
    pass: process.env.ZOHO_INFO_PASS || process.env.ZOHO_SMTP_PASS,
  },
});

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing email address' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: cleanEmail } });

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email address.' }, { status: 404 });
    }

    // Generate 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 15 minutes from now
    const expires = new Date(Date.now() + 15 * 60000);

    // Save to user
    user.reset_pin = pin;
    user.reset_pin_expires = expires;
    await user.save();

    // Send email
    const mailOptions = {
      from: `"VediCana Organics" <${process.env.ZOHO_INFO_USER || process.env.ZOHO_SMTP_USER}>`,
      to: cleanEmail,
      subject: 'Your Password Reset PIN - VediCana',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #166534; text-align: center;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>We received a request to reset the password for your VediCana account.</p>
          <p>Your 6-digit verification PIN is:</p>
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #166534; margin: 0; letter-spacing: 5px; font-size: 32px;">${pin}</h1>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This PIN will expire in 15 minutes.</p>
          <p>If you did not request this reset, please ignore this email.</p>
          <p style="margin-top: 30px;">Warm regards,<br/>The VediCana Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'A verification PIN has been sent to your email.'
    });

  } catch (error) {
    console.error('Forgot Password API Error:', error);
    return NextResponse.json({ error: 'An error occurred while generating the reset PIN.' }, { status: 500 });
  }
}
