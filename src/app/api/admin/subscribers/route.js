import { NextResponse } from 'next/server';
import models from '../../../../models/index.js';

const { Subscriber } = models;

export async function GET() {
  try {
    const subscribers = await Subscriber.findAll({
      order: [['createdAt', 'DESC']]
    });
    return NextResponse.json(subscribers);
  } catch (error) {
    console.error('Failed to fetch subscribers:', error);
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}
