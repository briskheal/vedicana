import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import models from '../../../models/index.js';

const { CareerApplication } = models;

// ── Zoho SMTP ───────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.ZOHO_SMTP_HOST || 'smtp.zoho.in',
  port: parseInt(process.env.ZOHO_SMTP_PORT || '465', 10),
  secure: true,
  auth: {
    user: process.env.ZOHO_HR_USER || process.env.ZOHO_SMTP_USER || 'hrpartner@vedicana.com',
    pass: process.env.ZOHO_HR_PASS || process.env.ZOHO_SMTP_PASS,
  },
});

// ── HR Notification Email (with attachment) ─────────────────────────────────
function buildHREmail({ full_name, email, phone, position, experience_years, location, cover_letter }, fileBuffer, fileName, fileType) {
  const adminEmail = 'hrpartner@vedicana.com';
  return {
    from: `"VediCana Careers" <hrpartner@vedicana.com>`,
    to: adminEmail,
    replyTo: email,
    subject: `📄 New Job Application: ${full_name} for ${position}`,
    html: `
      <h2>New Career Application Received</h2>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr><td style="background:#f4f4f4; width:30%;"><strong>Candidate Name</strong></td><td>${full_name}</td></tr>
        <tr><td style="background:#f4f4f4;"><strong>Email</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="background:#f4f4f4;"><strong>Phone</strong></td><td>${phone}</td></tr>
        <tr><td style="background:#f4f4f4;"><strong>Position Applied</strong></td><td>${position}</td></tr>
        <tr><td style="background:#f4f4f4;"><strong>Experience</strong></td><td>${experience_years} years</td></tr>
        <tr><td style="background:#f4f4f4;"><strong>Location</strong></td><td>${location}</td></tr>
      </table>
      <h3>Cover Letter / Message</h3>
      <div style="background:#f9fdf8; padding: 15px; border-left: 4px solid #006d39;">
        ${cover_letter ? cover_letter.replace(/\n/g, '<br/>') : '<em>No cover letter provided.</em>'}
      </div>
      <p style="color: #666; font-size: 13px; margin-top: 20px;">
        <em>The candidate's CV is attached to this email. You can also view and manage this application in the VediCana Admin Portal.</em>
      </p>
    `,
    attachments: [
      {
        filename: fileName,
        content: fileBuffer,
        contentType: fileType,
      }
    ]
  };
}


export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const full_name = formData.get('full_name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const position = formData.get('position');
    const experience_years = parseFloat(formData.get('experience_years') || 0);
    const location = formData.get('location');
    const cover_letter = formData.get('cover_letter');
    const resume = formData.get('resume'); // File object

    if (!full_name || !email || !phone || !position || !location || !resume) {
      return NextResponse.json({ error: 'Please fill all required fields including your current location, and upload your CV.' }, { status: 400 });
    }

    // Process file
    const fileBytes = await resume.arrayBuffer();
    const fileBuffer = Buffer.from(fileBytes);
    const base64Data = fileBuffer.toString('base64');
    
    // Check file size (max 3MB)
    if (fileBuffer.length > 3 * 1024 * 1024) {
      return NextResponse.json({ error: 'CV file size must be less than 3MB.' }, { status: 400 });
    }

    // Generate a safe randomized filename
    const ext = resume.name.split('.').pop() || 'pdf';
    const randomFileName = `CV_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

    // 1. Save to Database
    await CareerApplication.create({
      full_name,
      email,
      phone,
      position,
      experience_years,
      location,
      cover_letter,
      resume_file_name: randomFileName,
      resume_file_type: resume.type,
      resume_base64: base64Data,
      status: 'Pending'
    });

    // 2. Send Email to HR with attachment
    const hrEmail = buildHREmail({ full_name, email, phone, position, experience_years, location, cover_letter }, fileBuffer, randomFileName, resume.type);
    
    // 3. Send Auto-Reply to Candidate
    const candidateAutoReply = {
      from: `"VediCana HR" <hrpartner@vedicana.com>`,
      to: email,
      subject: `Application Received: ${position} at VediCana Organics`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #006d39;">Thank you for applying, ${full_name}!</h2>
          <p>We have successfully received your application and CV for the <strong>${position}</strong> role.</p>
          <p>Our HR team will review your qualifications and get back to you if your profile matches our requirements.</p>
          <p>Best regards,<br/><strong>VediCana Human Resources</strong></p>
        </div>
      `
    };

    // Fire emails
    await Promise.allSettled([
      transporter.sendMail(hrEmail),
      transporter.sendMail(candidateAutoReply)
    ]);

    return NextResponse.json({
      success: true,
      message: 'Your application has been submitted successfully!',
    }, { status: 201 });

  } catch (err) {
    console.error('Career API error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
