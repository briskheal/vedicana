async function poll() {
  console.log("Polling production login until it exposes stack trace...");
  while (true) {
    try {
      const res = await fetch('https://www.vedicana.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'jrdash.ctc@gmail.com', password: 'test' })
      });
      const data = await res.json();
      if (data.stack) {
        console.log("Found stack trace!");
        console.log(data);
        break;
      }
      console.log("Waiting for deploy...");
    } catch (error) {
      console.error("Fetch error:", error);
    }
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

poll();
