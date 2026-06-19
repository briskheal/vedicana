async function main() {
  try {
    const res = await fetch('https://www.vedicana.com/login');
    const html = await res.text();
    console.log("Includes EyeOff?", html.includes('EyeOff'));
  } catch (err) {
    console.error(err);
  }
}
main();
