import { NextResponse } from 'next/server';
import models from '../../../../../models/index.js';

const { ContactMessage } = models;

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const message = await ContactMessage.findByPk(id);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    await message.update({ status: body.status });
    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Failed to update message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const message = await ContactMessage.findByPk(id);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    await message.destroy();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete message:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
