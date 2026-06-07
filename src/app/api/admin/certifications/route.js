import { NextResponse } from 'next/server';
import models from '../../../../models/index.js';

const { Certification } = models;

export async function GET() {
  try {
    const certifications = await Certification.findAll({
      order: [
        ['order_index', 'ASC'],
        ['id', 'ASC']
      ]
    });
    return NextResponse.json(certifications);
  } catch (error) {
    console.error('[API Admin Certifications] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, image, order_index } = await request.json();

    if (!title || !image) {
      return NextResponse.json({ error: 'Title and Stamp Image are required' }, { status: 400 });
    }

    // Check maximum certifications limit of 9
    const count = await Certification.count();
    if (count >= 9) {
      return NextResponse.json({ 
        error: 'Maximum limit of 9 certifications reached. Please delete an existing stamp before adding a new one.' 
      }, { status: 400 });
    }

    const newCertification = await Certification.create({
      title,
      image,
      order_index: order_index !== undefined ? parseInt(order_index) : 0
    });

    return NextResponse.json(newCertification, { status: 201 });
  } catch (error) {
    console.error('[API Admin Certifications] POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
