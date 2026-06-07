import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const body = await req.json();
    const targetDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    if (body.image) {
      // Strip header if base64 data url
      const base64Data = body.image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const targetPath = path.join(targetDir, 'logo.webp');
      fs.writeFileSync(targetPath, buffer);
      console.log('[API Admin Logo] Saved logo successfully at:', targetPath);
    }

    if (body.height !== undefined) {
      const configPath = path.join(targetDir, 'logo_config.json');
      fs.writeFileSync(configPath, JSON.stringify({ height: Number(body.height) }), 'utf8');
      console.log('[API Admin Logo] Saved logo height config:', body.height);
    }

    return NextResponse.json({ success: true, path: '/logo.webp' });
  } catch (error) {
    console.error('[API Admin Logo] Error saving logo config:', error);
    return NextResponse.json({ error: error.message || 'Failed to save logo config' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const targetPath = path.join(process.cwd(), 'public', 'logo.webp');
    const exists = fs.existsSync(targetPath);

    const configPath = path.join(process.cwd(), 'public', 'logo_config.json');
    let height = 48; // default fallback
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (config.height) {
          height = Number(config.height);
        }
      } catch (e) {
        console.error('[API Admin Logo] Error parsing config:', e);
      }
    }

    return NextResponse.json({ exists, path: exists ? '/logo.webp' : null, height });
  } catch (error) {
    return NextResponse.json({ exists: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const targetPath = path.join(process.cwd(), 'public', 'logo.webp');
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }

    const configPath = path.join(process.cwd(), 'public', 'logo_config.json');
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to delete logo assets' }, { status: 500 });
  }
}
