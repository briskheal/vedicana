import { NextResponse } from 'next/server';
import models from '../../../../../models/index.js';

const { CareerApplication } = models;

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const application = await CareerApplication.findByPk(id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    await application.update({ status: body.status });
    
    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error('Failed to update application:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const application = await CareerApplication.findByPk(id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    await application.destroy();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete application:', error);
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
  }
}
