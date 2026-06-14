import { NextResponse } from 'next/server';
import Product from '../../../models/Product.js';
import Category from '../../../models/Category.js';
import { Op } from 'sequelize';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    if (!q || q.length < 2) {
      return NextResponse.json({ products: [], categories: [] });
    }

    const [products, categories] = await Promise.all([
      Product.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { title: { [Op.iLike]: `%${q}%` } },
            { description: { [Op.iLike]: `%${q}%` } },
            { tags: { [Op.overlap]: [q] } } // Note: array overlap might be postgres specific, we'll keep it simple
          ]
        },
        limit: 5,
        attributes: ['id', 'title', 'slug', 'image', 'price', 'sale_price']
      }),
      Category.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${q}%` } },
            { description: { [Op.iLike]: `%${q}%` } }
          ]
        },
        limit: 3,
        attributes: ['id', 'name', 'slug']
      })
    ]);

    return NextResponse.json({ 
      products: products.map(p => p.get({ plain: true })),
      categories: categories.map(c => c.get({ plain: true }))
    });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
