import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 2525,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});

export async function sendOrderConfirmation(order, userEmail, userName) {
  try {
    const senderEmail = 'info@vedicana.com';
    const adminEmail = 'info@vedicana.com';

    let shippingObj = {};
    try {
      shippingObj = typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress;
    } catch (e) {
      // Ignore
    }

    const itemsHtml = (order.items || order.OrderItems || []).map(item => {
      const title = item.Product?.title || 'Ayurvedic Remedy';
      const variantStr = item.variant ? ` (${item.variant})` : '';
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${title}${variantStr}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
        </tr>
      `;
    }).join('');

    const customerHtml = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          <div style="text-align: center; border-bottom: 2px solid #006d39; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #006d39; margin: 0;">VediCana Organics</h1>
            <p style="color: #666; margin: 5px 0 0;">Ayush & WHO GMP Certified</p>
          </div>
          
          <h2 style="color: #222;">Thank you for your purchase, ${userName}! 🙏</h2>
          <p>We are thrilled to confirm your order from VediCana Organics. Your authentic Ayurvedic products will be prepared and shipped shortly.</p>
          
          <div style="background: #f4fdf8; padding: 15px; border-left: 4px solid #006d39; margin: 20px 0;">
            <p style="margin: 0;"><strong>Order ID:</strong> #${order.id}</p>
            <p style="margin: 5px 0 0;"><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
            <p style="margin: 5px 0 0;"><strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'upi_direct' ? 'UPI Direct' : 'Razorpay'}</p>
          </div>

          <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f9f9f9;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #eee;">Item</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #eee;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #eee;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Shipping Address</h3>
          <p style="color: #555;">
            ${shippingObj.billingFirstName || ''} ${shippingObj.billingLastName || ''}<br/>
            ${shippingObj.billingAddress || shippingObj.address || ''}<br/>
            ${shippingObj.billingCity || shippingObj.city || ''}, ${shippingObj.billingState || shippingObj.state || ''} - ${shippingObj.billingPincode || shippingObj.pincode || ''}<br/>
            Phone: ${shippingObj.billingPhone || shippingObj.phone || ''}
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #888;">
            <p>If you have any questions, simply reply to this email or contact us at ${adminEmail}.</p>
            <p>© 2025 VediCana Organics. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const adminHtml = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>🛒 New Order Received - #${order.id}</h2>
        <p><strong>Customer:</strong> ${userName} (${userEmail})</p>
        <p><strong>Total:</strong> ₹${order.totalAmount}</p>
        <p><strong>Method:</strong> ${order.paymentMethod}</p>
        
        <h3>Items:</h3>
        <table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
          ${itemsHtml}
        </table>
        
        <p>Please check the <a href="https://vedicana.com/admin/orders">Admin Dashboard</a> to manage this order.</p>
      </body>
      </html>
    `;

    // Send emails
    if (userEmail) {
      await transporter.sendMail({
        from: `"VediCana Organics" <${senderEmail}>`,
        to: userEmail,
        subject: '✅ Order Confirmation — VediCana Organics',
        html: customerHtml,
      });
    }

    await transporter.sendMail({
      from: `"VediCana Website" <${senderEmail}>`,
      to: adminEmail,
      subject: `🛒 New Order Received - #${order.id}`,
      html: adminHtml,
    });

    console.log(`[Email] Order confirmation sent for Order #${order.id}`);
  } catch (error) {
    console.error(`[Email Error] Failed to send order confirmation for Order #${order?.id}:`, error);
  }
}

export async function sendAbandonedCartReminder(email, cartData) {
  try {
    const senderEmail = 'info@vedicana.com';

    const itemsHtml = cartData.map(item => {
      const title = item.title || 'Ayurvedic Remedy';
      const variantStr = item.selectedVariant ? ` (${item.selectedVariant})` : '';
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${title}${variantStr}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
        </tr>
      `;
    }).join('');

    const customerHtml = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          <div style="text-align: center; border-bottom: 2px solid #006d39; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #006d39; margin: 0;">VediCana Organics</h1>
            <p style="color: #666; margin: 5px 0 0;">Ayush & WHO GMP Certified</p>
          </div>
          
          <h2 style="color: #222;">Did you forget something? 🛒</h2>
          <p>We noticed you left some authentic Ayurvedic remedies in your cart. We've saved them for you, but they might sell out soon!</p>
          
          <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Your Cart Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #f9f9f9;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #eee;">Item</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #eee;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #eee;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://vedicana.com/checkout" style="background-color: #006d39; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Complete Your Purchase</a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #888;">
            <p>© 2025 VediCana Organics. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"VediCana Organics" <${senderEmail}>`,
      to: email,
      subject: 'You left something behind at VediCana...',
      html: customerHtml,
    });

    console.log(`[Email] Abandoned cart reminder sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email Error] Failed to send abandoned cart reminder to ${email}:`, error);
    return false;
  }
}
