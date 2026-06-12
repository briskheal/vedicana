import { NextResponse } from 'next/server';
import models from '../../../../models/index.js';

const { ContactMessage } = models;

export async function GET() {
  try {
    const messages = await ContactMessage.findAll({
      order: [['createdAt', 'DESC']]
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch contact messages:', error);
    return NextResponse.json({ error: 'Failed to fetch contact messages' }, { status: 500 });
  }
}
