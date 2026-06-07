import { NextResponse } from 'next/server';
import models from '../../../../models/index.js';

const { Review, Product } = models;

export async function GET() {
  try {
    const reviews = await Review.findAll({
      include: [
        {
          model: Product,
          attributes: ['id', 'title', 'slug', 'image']
        }
      ],
      order: [
        ['is_approved', 'ASC'], // Pending reviews first
        ['createdAt', 'DESC']   // Newest first
      ]
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('[API Admin Reviews] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
