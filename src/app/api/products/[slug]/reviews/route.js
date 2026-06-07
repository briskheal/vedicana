import { NextResponse } from 'next/server';
import models from '../../../../../models/index.js';

const { Product, Review } = models;

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    const product = await Product.findOne({ where: { slug } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const reviews = await Review.findAll({
      where: {
        productId: product.id,
        is_approved: true
      },
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('[API Product Reviews] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    const { author, email, rating, comment } = await request.json();

    if (!author || !email || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields: author, email, rating, comment' }, { status: 400 });
    }

    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 });
    }

    const product = await Product.findOne({ where: { slug } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const newReview = await Review.create({
      author,
      email,
      rating: parsedRating,
      comment,
      is_approved: false, // Default is false for admin moderation!
      productId: product.id
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('[API Product Reviews] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
