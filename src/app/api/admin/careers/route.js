import { NextResponse } from 'next/server';
import models from '../../../../models/index.js';

const { CareerApplication } = models;

export async function GET() {
  try {
    // Exclude resume_base64 to prevent massive JSON payloads!
    const applications = await CareerApplication.findAll({
      attributes: { exclude: ['resume_base64'] },
      order: [['createdAt', 'DESC']],
    });
    
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Failed to fetch career applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}
