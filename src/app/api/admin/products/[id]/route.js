import { NextResponse } from 'next/server';
import models from '../../../../../models/index.js';

const { Product } = models;

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const product = await Product.findByPk(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('[API Admin Product Item] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    const product = await Product.findByPk(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { 
      title, 
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

    const incomingCategoryId = categoryId !== undefined ? categoryId : CategoryId;

    await Product.update({
      title: title ?? product.title,
      price: price ? parseFloat(price) : product.price,
      sale_price: sale_price !== undefined ? (sale_price ? parseFloat(sale_price) : null) : product.sale_price,
      stock: stock !== undefined ? parseInt(stock, 10) : product.stock,
      is_featured: is_featured !== undefined ? !!is_featured : product.is_featured,
      description: description ?? product.description,
      short_description: short_description ?? product.short_description,
      specification: specification ?? product.specification,
      additional_info: additional_info !== undefined ? additional_info : product.additional_info,
      tax_rate: tax_rate !== undefined ? parseInt(tax_rate, 10) : product.tax_rate,
      image: image !== undefined ? image : product.image,
      gallery: gallery !== undefined ? gallery : product.gallery,
      categoryId: incomingCategoryId !== undefined ? (incomingCategoryId ? parseInt(incomingCategoryId, 10) : null) : product.categoryId
    }, {
      where: { id }
    });

    const updatedProduct = await Product.findByPk(id);
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('[API Admin Product Item] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const product = await Product.findByPk(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Cascading is handled at Sequelize level (deletes OrderItems/Reviews references)
    await Product.destroy({ where: { id } });
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('[API Admin Product Item] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
