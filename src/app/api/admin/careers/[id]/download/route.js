import { NextResponse } from 'next/server';
import models from '../../../../../../models/index.js';

const { CareerApplication } = models;

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // We only fetch the base64 and filename here to keep it lightweight
    const application = await CareerApplication.findByPk(id, {
      attributes: ['resume_base64', 'resume_file_name', 'resume_file_type']
    });

    if (!application || !application.resume_base64) {
      return new NextResponse('CV not found', { status: 404 });
    }

    const fileBuffer = Buffer.from(application.resume_base64, 'base64');
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': application.resume_file_type || 'application/pdf',
        'Content-Disposition': `attachment; filename="${application.resume_file_name || 'Resume.pdf'}"`,
      },
    });
  } catch (error) {
    console.error('Failed to download CV:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
