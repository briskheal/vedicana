import { NextResponse } from 'next/server';
import models from '../../../../models/index.js';

const { Product, Category } = models;

export async function GET() {
  try {
    const products = await Product.findAll({
      include: [{ model: Category }],
      order: [['createdAt', 'DESC']]
    });
    
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });

    return NextResponse.json({ products, categories });
  } catch (error) {
    console.error('[API Admin Products] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      title, 
      slug, 
      price, 
      sale_price, 
      stock, 
      is_featured, 
      description, 
      short_description,
      specification, 
      additional_info, 
      tax_rate, 
      image, 
      gallery, 
      categoryId,
      CategoryId 
    } = body;

    if (!title || !price) {
      return NextResponse.json({ error: 'Title and Base Price are required' }, { status: 400 });
    }

    // Generate unique slug if not provided
    const cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-');

    const existingProduct = await Product.findOne({ where: { slug: cleanSlug } });
    if (existingProduct) {
      return NextResponse.json({ error: `A product with slug "${cleanSlug}" already exists.` }, { status: 400 });
    }

    const incomingCategoryId = categoryId !== undefined ? categoryId : CategoryId;

    const newProduct = await Product.create({
      title,
      slug: cleanSlug,
      price: parseFloat(price),
      sale_price: sale_price ? parseFloat(sale_price) : null,
      stock: stock ? parseInt(stock, 10) : 0,
      is_featured: !!is_featured,
      description: description || '',
      short_description: short_description || '',
      specification: specification || '',
      additional_info: additional_info || null,
      tax_rate: tax_rate ? parseInt(tax_rate, 10) : 5,
      image: image || null,
      gallery: gallery || null,
      categoryId: incomingCategoryId ? parseInt(incomingCategoryId, 10) : null
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('[API Admin Products] POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
