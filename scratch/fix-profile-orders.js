import fs from 'fs';
import path from 'path';

function updateProfileOrders() {
  const file = path.join(process.cwd(), 'src/components/ProfileDashboard.js');
  let content = fs.readFileSync(file, 'utf8');

  const oldCodeStart = '{user.Orders && user.Orders.length > 0 ? (\\s*<div className="space-y-4">\\s*\\{user\\.Orders\\.map\\(order => \\(\\s*<div key=\\{order\\.id\\}';
  const regex = new RegExp(`\\{user\\.Orders && user\\.Orders\\.length > 0 \\? \\([\\s\\S]*?\\) : \\(`, 'g');
  
  const newTableCode = `{user.Orders && user.Orders.length > 0 ? (
              <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[11px] font-bold">
                    <tr>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4">Method</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {user.Orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-vedicana-green">
                          ₹{order.totalAmount}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {order.paymentMethod === 'cod' ? 'COD' : 'Razorpay'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider \${
                            order.status === 'processing' || order.status === 'shipped' || order.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : order.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }\`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-4">
                          <a 
                            href={\`/orders/\${order.id}/invoice\`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-vedicana-green font-medium hover:text-emerald-700 transition-colors"
                          >
                            Invoice
                          </a>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (`;

  content = content.replace(regex, newTableCode);

  fs.writeFileSync(file, content);
  console.log("Updated ProfileDashboard with Excel-like table");
}

updateProfileOrders();
