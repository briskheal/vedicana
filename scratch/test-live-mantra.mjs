async function main() {
  try {
    const res = await fetch('https://www.vedicana.com/discover-vedic-culture');
    const html = await res.text();
    console.log("Includes MantraPlayer (Listen Vedic Mantras)?", html.includes('Listen Vedic Mantras'));
    console.log("Includes ChakraWheel?", html.includes('ChakraWheel') || html.includes('Muladhara') || html.includes('Chakra'));
  } catch (err) {
    console.error(err);
  }
}
main();
