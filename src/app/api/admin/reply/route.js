import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { to, subject, message, bucket } = await request.json();

    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'To, subject and message are required.' }, { status: 400 });
    }

    // Pick the right Zoho account based on which inbox bucket the reply is from
    let user, pass, fromName;
    if (bucket === 'career') {
      user = process.env.ZOHO_HR_USER || process.env.ZOHO_SMTP_USER;
      pass = process.env.ZOHO_HR_PASS || process.env.ZOHO_SMTP_PASS;
      fromName = 'VediCana HR';
    } else if (bucket === 'subscribe') {
      user = process.env.ZOHO_NEWSLETTER_USER || process.env.ZOHO_SMTP_USER;
      pass = process.env.ZOHO_NEWSLETTER_PASS || process.env.ZOHO_SMTP_PASS;
      fromName = 'VediCana Updates';
    } else {
      user = process.env.ZOHO_INFO_USER || process.env.ZOHO_SMTP_USER;
      pass = process.env.ZOHO_INFO_PASS || process.env.ZOHO_SMTP_PASS;
      fromName = 'VediCana Organics';
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.in',
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"${fromName}" <${user}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="border-left: 4px solid #006d39; padding-left: 16px; margin-bottom: 24px;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="font-size: 12px; color: #999;">
            This email was sent from the VediCana Admin Portal.<br/>
            VediCana Organics | <a href="https://www.vedicana.com" style="color: #006d39;">www.vedicana.com</a>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Reply sent successfully!' });
  } catch (error) {
    console.error('Reply send error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send reply' }, { status: 500 });
  }
}
