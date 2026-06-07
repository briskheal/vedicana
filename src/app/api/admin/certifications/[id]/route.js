import { NextResponse } from 'next/server';
import models from '../../../../../models/index.js';

const { Certification } = models;

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const certification = await Certification.findByPk(id);
    if (!certification) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
    }

    await Certification.destroy({ where: { id } });

    return NextResponse.json({ message: 'Certification deleted successfully' });
  } catch (error) {
    console.error('[API Admin Certification Item] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
