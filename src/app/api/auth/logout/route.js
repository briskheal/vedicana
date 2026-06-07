import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  // Delete the session cookie
  response.cookies.delete('vedicana_session');
  
  return response;
}
