import { NextResponse } from 'next/server';
import models from '../../../../../models/index.js';

const { Review } = models;

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { is_approved } = await request.json();

    const review = await Review.findByPk(id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    await Review.update(
      { is_approved: is_approved ?? review.is_approved },
      { where: { id } }
    );

    const updatedReview = await Review.findByPk(id);
    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('[API Admin Review Item] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const review = await Review.findByPk(id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    await Review.destroy({ where: { id } });
    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('[API Admin Review Item] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
