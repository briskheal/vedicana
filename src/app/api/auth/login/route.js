import { NextResponse } from 'next/server';
import User from '../../../../models/User.js';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // Direct Admin Config Credentials Sync (settings_config.json or ENV fallback)
    try {
      const configPath = path.join(process.cwd(), 'public/settings_config.json');
      let settingsConfig = {};
      if (fs.existsSync(configPath)) {
        settingsConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      }
      
      const adminEmail = (settingsConfig.admin_email || process.env.ADMIN_ID || 'admin@vedicana.com').toLowerCase().trim();
      const adminPassword = settingsConfig.admin_password || process.env.ADMIN_PASSWORD || 'VedicanaOrganics@1306';
      const inputEmail = email.toLowerCase().trim();

      if (inputEmail === adminEmail && password === adminPassword) {
        let dbUser = await User.findOne({ where: { email: inputEmail } });
        const passwordHash = await bcrypt.hash(adminPassword, 10);
        if (!dbUser) {
          await User.create({
            name: 'VediCana Admin',
            email: inputEmail,
            password: passwordHash,
            role: 'admin'
          });
        } else if (dbUser.role !== 'admin') {
          dbUser.role = 'admin';
          dbUser.password = passwordHash;
          await dbUser.save();
        }
      }
    } catch (err) {
      console.error("Failed to sync override admin config during login:", err);
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT Token using jose
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key_vedicana_auth_xyz123');
    const token = await new SignJWT({ id: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    // Create response and set HTTP-only cookie
    const response = NextResponse.json({ success: true, message: 'Logged in successfully' });
    response.cookies.set({
      name: 'vedicana_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message, stack: error.stack }, { status: 500 });
  }
}
