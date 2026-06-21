import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { to, subject, message, bucket } = await request.json();

    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'To, subject and message are required.' }, { status: 400 });
    }

    // Define the appropriate name and email based on the bucket
    let fromName, user;
    if (bucket === 'career') {
      fromName = 'VediCana HR';
      user = 'hrpartner@vedicana.com';
    } else if (bucket === 'subscribe') {
      fromName = 'VediCana Updates';
      user = 'newsletter@vedicana.com';
    } else {
      fromName = 'VediCana Organics';
      user = 'info@vedicana.com';
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 2525,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
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
