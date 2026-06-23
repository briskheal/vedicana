import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import models from '../../../models/index.js';

const { Wishlist, Product } = models;

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('vedicana_session')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key_vedicana_auth_xyz123');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

// GET — fetch the user's wishlist
export async function GET() {
  try {
    await Wishlist.sync({ alter: true });
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const items = await Wishlist.findAll({
      where: { userId: user.id },
      include: [{
        model: Product,
        attributes: ['id', 'title', 'price', 'compareAtPrice', 'images', 'slug', 'stock'],
      }],
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json(items.map(i => i.toJSON()));
  } catch (error) {
    console.error('GET Wishlist Error:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist.' }, { status: 500 });
  }
}

// POST — add a product to the wishlist
export async function POST(request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId } = await request.json();
    if (!productId) return NextResponse.json({ error: 'productId required.' }, { status: 400 });

    // findOrCreate prevents duplicates
    const [item, created] = await Wishlist.findOrCreate({
      where: { userId: user.id, productId },
    });

    return NextResponse.json({ success: true, created, id: item.id });
  } catch (error) {
    console.error('POST Wishlist Error:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist.' }, { status: 500 });
  }
}

// DELETE — remove a product from the wishlist
export async function DELETE(request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId } = await request.json();
    if (!productId) return NextResponse.json({ error: 'productId required.' }, { status: 400 });

    await Wishlist.destroy({ where: { userId: user.id, productId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE Wishlist Error:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist.' }, { status: 500 });
  }
}
