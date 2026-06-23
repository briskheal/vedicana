import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import models from '../../../../models/index.js';
import bcrypt from 'bcryptjs';

const { User } = models;
const configPath = path.join(process.cwd(), 'public/settings_config.json');

// Helper to get default settings
const getDefaultSettings = () => ({
  company_name: 'VediCana Organics',
  company_address: 'Plot No. 120, GIDC Industrial Estate, Makarpura, Vadodara - 390010, Gujarat, India',
  company_phone: '+91 94372 72884',
  company_email: 'support@vedicana.com',
  company_gst: '24AAAAA0000A1Z5',
  sweden_office: 'VediCana Partner Office, Stockholm, Sweden (Excluding Distribution)',
  global_offices: ['VediCana Partner Office, Stockholm, Sweden (Excluding Distribution)'],
  marketed_by: 'VediCana Wellness Pvt. Ltd.',
  marketing_office_addr: 'Vraj Raj Complex, Ambamata-Temple Road, Karelibaug, Vadodara-390018, Gujarat, India',
  admin_email: 'jrdash.ctc@gmail.com',
  admin_password: 'VedicanaOrganics@1306',
  courier_partners: [],
  terms_conditions: '1. All sales of Ayurvedic formulations are final.\n2. Any manufacturing defect claims must be filed within 7 days of delivery.\n3. Product efficacy may vary depending on individual Prakriti.',
  invoice_prefix: 'INV-2026-',
  invoice_start_no: 1001,
  consultation_prefix: 'CNS-2026-',
  consultation_start_no: 1001,
  bank_name: '',
  bank_account_no: '',
  bank_account_name: '',
  bank_ifsc: '',
  bank_branch: '',
  bank_upi_id: '',
  bank_show_qr: true,
  bank_qr_type: 'dynamic',
  bank_static_qr_image: '',
  bank_upi_provider: 'all',
  authorized_signature: '',
  ga_id: '',
  fb_pixel_id: ''
});

export async function GET() {
  try {
    let settings = getDefaultSettings();
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      settings = { ...settings, ...JSON.parse(data) };
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('[API Admin Settings] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    let currentSettings = getDefaultSettings();
    
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      currentSettings = { ...currentSettings, ...JSON.parse(data) };
    }

    const updatedSettings = {
      company_name: body.company_name ?? currentSettings.company_name,
      company_address: body.company_address ?? currentSettings.company_address,
      company_phone: body.company_phone ?? currentSettings.company_phone,
      company_email: body.company_email ?? currentSettings.company_email,
      company_gst: body.company_gst ?? currentSettings.company_gst,
      sweden_office: body.sweden_office ?? currentSettings.sweden_office,
      global_offices: body.global_offices ?? currentSettings.global_offices ?? ['VediCana Partner Office, Stockholm, Sweden (Excluding Distribution)'],
      marketed_by: body.marketed_by ?? currentSettings.marketed_by,
      marketing_office_addr: body.marketing_office_addr ?? currentSettings.marketing_office_addr,
      admin_email: body.admin_email ?? currentSettings.admin_email,
      admin_password: body.admin_password ?? currentSettings.admin_password,
      courier_partners: body.courier_partners ?? currentSettings.courier_partners ?? [],
      terms_conditions: body.terms_conditions ?? currentSettings.terms_conditions ?? '',
      invoice_prefix: body.invoice_prefix ?? currentSettings.invoice_prefix ?? 'INV-2026-',
      invoice_start_no: body.invoice_start_no !== undefined ? Number(body.invoice_start_no) : currentSettings.invoice_start_no ?? 1001,
      consultation_prefix: body.consultation_prefix ?? currentSettings.consultation_prefix ?? 'CNS-2026-',
      consultation_start_no: body.consultation_start_no !== undefined ? Number(body.consultation_start_no) : currentSettings.consultation_start_no ?? 1001,
      bank_name: body.bank_name ?? currentSettings.bank_name ?? '',
      bank_account_no: body.bank_account_no ?? currentSettings.bank_account_no ?? '',
      bank_account_name: body.bank_account_name ?? currentSettings.bank_account_name ?? '',
      bank_ifsc: body.bank_ifsc ?? currentSettings.bank_ifsc ?? '',
      bank_branch: body.bank_branch ?? currentSettings.bank_branch ?? '',
      bank_upi_id: body.bank_upi_id ?? currentSettings.bank_upi_id ?? '',
      bank_show_qr: body.bank_show_qr ?? currentSettings.bank_show_qr ?? true,
      bank_qr_type: body.bank_qr_type ?? currentSettings.bank_qr_type ?? 'dynamic',
      bank_static_qr_image: body.bank_static_qr_image ?? currentSettings.bank_static_qr_image ?? '',
      bank_upi_provider: body.bank_upi_provider ?? currentSettings.bank_upi_provider ?? 'all',
      authorized_signature: body.authorized_signature ?? currentSettings.authorized_signature ?? '',
      ga_id: body.ga_id ?? currentSettings.ga_id ?? '',
      fb_pixel_id: body.fb_pixel_id ?? currentSettings.fb_pixel_id ?? ''
    };

    // Keep legacy sweden_office in sync for root layout
    if (Array.isArray(updatedSettings.global_offices) && updatedSettings.global_offices.length > 0) {
      updatedSettings.sweden_office = updatedSettings.global_offices[0];
    }

    // Save to file
    fs.writeFileSync(configPath, JSON.stringify(updatedSettings, null, 2), 'utf-8');

    // Sync admin password & role to database User record
    if (updatedSettings.admin_email) {
      const email = updatedSettings.admin_email.toLowerCase().trim();
      let dbUser = await User.findOne({ where: { email } });
      const passwordHash = await bcrypt.hash(updatedSettings.admin_password, 10);
      
      if (dbUser) {
        dbUser.password = passwordHash;
        dbUser.role = 'admin';
        await dbUser.save();
      } else {
        await User.create({
          name: 'VediCana Admin',
          email,
          password: passwordHash,
          role: 'admin'
        });
      }
    }

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error('[API Admin Settings] POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
