import { NextResponse } from 'next/server';
import models from '../../../../../models/index.js';

const { Subscriber } = models;

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const subscriber = await Subscriber.findByPk(id);
    if (!subscriber) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }

    await subscriber.destroy();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete subscriber:', error);
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 });
  }
}
