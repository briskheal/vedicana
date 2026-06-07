async function test() {
  try {
    const res = await fetch('https://vedicana.com/wp-json/wc/store/products?per_page=1');
    const products = await res.json();
    console.log(JSON.stringify(products[0], null, 2));
  } catch (err) {
    console.error(err);
  }
}
test();
