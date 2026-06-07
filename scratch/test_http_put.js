async function test() {
  try {
    const id = 3; // Use order ID 3
    const payload = {
      status: 'returned',
      returnItems: [
        {
          productId: 65,
          productName: "VediCana Stevia Drop",
          variant: null,
          quantity: 1,
          mode: 'damaged'
        }
      ],
      shippingAddress: JSON.stringify({
        address: "Test Address",
        returnLog: [
          {
            productId: 65,
            productName: "VediCana Stevia Drop",
            variant: null,
            quantity: 1,
            mode: 'damaged'
          }
        ]
      })
    };

    console.log(`Sending PUT to http://localhost:3000/api/admin/orders/${id}...`);
    const res = await fetch(`http://localhost:3000/api/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log(`Response Status: ${res.status}`);
    const data = await res.json();
    console.log("Response Body:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("HTTP Request Failed:", err);
  }
}

test();
