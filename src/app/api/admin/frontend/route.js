import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'public', 'social_config.json');

export async function GET() {
  try {
    let config = {
      facebook: '',
      instagram: '',
      linkedin: '',
      youtube: '',
      twitter: '',
      whatsapp: ''
    };

    if (fs.existsSync(configPath)) {
      try {
        const fileContent = fs.readFileSync(configPath, 'utf8');
        config = { ...config, ...JSON.parse(fileContent) };
      } catch (err) {
        console.error('[API Frontend Settings] Error parsing config file:', err);
      }
    }

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to read settings' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Structure incoming configurations
    const newConfig = {
      facebook: body.facebook || '',
      instagram: body.instagram || '',
      linkedin: body.linkedin || '',
      youtube: body.youtube || '',
      twitter: body.twitter || '',
      whatsapp: body.whatsapp || ''
    };

    const targetDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf8');
    console.log('[API Frontend Settings] Saved social links successfully.');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Frontend Settings] Error saving settings:', error);
    return NextResponse.json({ error: error.message || 'Failed to save settings' }, { status: 500 });
  }
}
