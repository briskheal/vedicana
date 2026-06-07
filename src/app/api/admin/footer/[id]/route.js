import { NextResponse } from 'next/server';
import models from '../../../../../models/index.js';

const { FooterLink } = models;

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const link = await FooterLink.findByPk(id);
    if (!link) {
      return NextResponse.json({ error: 'Footer link not found' }, { status: 404 });
    }

    await FooterLink.destroy({ where: { id } });
    return NextResponse.json({ message: 'Footer link deleted successfully' });
  } catch (error) {
    console.error('[API Admin Footer Item] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
