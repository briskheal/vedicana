async function testProfileRoute() {
  try {
    // 1. Login
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vedicana', password: 'VedicanaOrganics@1306' })
    });
    const loginData = await loginRes.json();
    console.log("Login:", loginData);
    
    const cookies = loginRes.headers.get('set-cookie');
    if (!cookies) {
      console.log("No cookies received.");
      return;
    }
    
    // 2. Fetch Profile Page HTML
    const profileRes = await fetch('http://localhost:3000/profile', {
      headers: { 'Cookie': cookies }
    });
    
    console.log("Profile Status:", profileRes.status);
    const html = await profileRes.text();
    if (profileRes.status === 500 || html.includes('Internal Server Error') || html.includes('Error:')) {
      console.log("Profile Error detected.");
      console.log(html.substring(0, 1000));
    } else {
      console.log("Profile loaded successfully.");
    }
  } catch (err) {
    console.error(err);
  }
}

testProfileRoute();
