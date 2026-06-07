import { NextResponse } from 'next/server';
import models from '../../../../models/index.js';

const { Category, Product } = models;

export async function GET() {
  try {
    // Fetch categories with associated products to count them safely in JS
    const categories = await Category.findAll({
      include: [{ 
        model: Product, 
        attributes: ['id'] 
      }],
      order: [['name', 'ASC']]
    });

    const result = categories.map(cat => {
      const plain = cat.get({ plain: true });
      plain.productCount = plain.Products ? plain.Products.length : 0;
      delete plain.Products; // clean output
      return plain;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API Admin Categories] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, slug } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-');

    const existingCategory = await Category.findOne({ where: { slug: cleanSlug } });
    if (existingCategory) {
      return NextResponse.json({ error: `A category with slug "${cleanSlug}" already exists.` }, { status: 400 });
    }

    const newCategory = await Category.create({
      name,
      slug: cleanSlug
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('[API Admin Categories] POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
