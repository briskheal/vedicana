import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import User from '../../models/User.js';
import Order from '../../models/Order.js';
import OrderItem from '../../models/OrderItem.js';
import Product from '../../models/Product.js';
import ProfileDashboard from '../../components/ProfileDashboard';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('vedicana_session')?.value;

  if (!token) {
    redirect('/login');
  }

  let decoded;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key_vedicana_auth_xyz123');
    const { payload } = await jwtVerify(token, secret);
    decoded = payload;
  } catch (err) {
    console.error("JWT Verification failed:", err);
    redirect('/login');
  }

  // Fetch full user and order history from DB
  const user = await User.findByPk(decoded.id, {
    include: [
      { 
        model: Order, 
        as: 'Orders', 
        separate: true, 
        order: [['createdAt', 'DESC']],
        include: [{
          model: OrderItem,
          include: [{ model: Product, attributes: ['name'] }]
        }]
      }
    ]
  });

  if (!user) {
    redirect('/login');
  }

  // Convert Sequelize model to a plain, serializable JSON object for the Client Component
  const serializedUser = JSON.parse(JSON.stringify(user.toJSON()));

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProfileDashboard initialUser={serializedUser} />
      </div>
    </div>
  );
}
