// Test SMTP connection directly — run: node scratch/test-smtp.mjs
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: 'newsletter@vedicana.com',
    pass: 'Yndtza9EcdZT',
  },
});

console.log('🔌 Testing SMTP connection to smtp.zoho.in:465...');

try {
  await transporter.verify();
  console.log('✅ SMTP connection OK! Credentials are valid.\n');

  console.log('📧 Sending test email...');
  const info = await transporter.sendMail({
    from: '"VediCana Test" <newsletter@vedicana.com>',
    to: 'newsletter@vedicana.com',
    subject: '✅ SMTP Test — VediCana',
    html: '<p>SMTP is working correctly on port 465 SSL.</p>',
  });
  console.log('✅ Test email sent! MessageId:', info.messageId);
  console.log('\n🎉 Email delivery is working. Issue must be in Vercel env vars — check they are set and redeployed.');
} catch (err) {
  console.error('❌ SMTP Error:', err.message);
  console.error('\nFull error:', err);

  if (err.message.includes('535') || err.message.includes('auth')) {
    console.error('\n🔑 CAUSE: Wrong credentials — check ZOHO_SMTP_USER and ZOHO_SMTP_PASS');
  } else if (err.message.includes('connect') || err.message.includes('ECONNREFUSED')) {
    console.error('\n🌐 CAUSE: Port 465 blocked — try port 587');
  } else if (err.message.includes('certificate') || err.message.includes('TLS')) {
    console.error('\n🔒 CAUSE: TLS/SSL issue');
  }
} finally {
  process.exit(0);
}
