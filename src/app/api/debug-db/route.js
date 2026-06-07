import { NextResponse } from 'next/server';
import sequelize from '../../../lib/sequelize.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Hide password in log/display
    const rawDbUrl = process.env.DATABASE_URL || '';
    const safeDbUrl = rawDbUrl.replace(/:[^:@]+@/, ':****@');

    console.log('API Debug DB: Attempting connection...');
    await sequelize.authenticate();
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to the database!',
      databaseUrlUsed: safeDbUrl,
      nodeEnv: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('API Debug DB: Connection failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to the database',
      error: error.message,
      stack: error.stack,
      parentError: error.parent ? error.parent.message : null,
      databaseUrlUsed: (process.env.DATABASE_URL || '').replace(/:[^:@]+@/, ':****@'),
      nodeEnv: process.env.NODE_ENV
    }, { status: 500 });
  }
}
