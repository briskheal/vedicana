import { NextResponse } from 'next/server';
import models from '../../../../../models/index.js';

const { Category, Product } = models;

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const category = await Category.findByPk(id);

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('[API Admin Category Item] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { name, slug } = await request.json();

    const category = await Category.findByPk(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const updatedData = {};
    if (name) updatedData.name = name;
    if (slug) {
      const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
      updatedData.slug = cleanSlug;
    }

    await Category.update(updatedData, {
      where: { id }
    });

    const updatedCategory = await Category.findByPk(id);
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('[API Admin Category Item] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const category = await Category.findByPk(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Unlink products associated with this category to prevent foreign key errors
    await Product.update(
      { categoryId: null },
      { where: { categoryId: id } }
    );

    await Category.destroy({ where: { id } });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('[API Admin Category Item] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
