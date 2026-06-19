async function testLogin() {
  console.log("Testing production login...");
  try {
    const res = await fetch('https://www.vedicana.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'jrdash.ctc@gmail.com', password: 'test' })
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response:", data);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

testLogin();
