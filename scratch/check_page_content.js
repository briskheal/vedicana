async function test() {
  try {
    const res = await fetch('https://vedicana.com/product/vedicana-spirulina-powder/');
    const html = await res.text();
    console.log(`HTML length: ${html.length}`);
    // Print some of the content area
    const index = html.indexOf('woocommerce-product-details__short-description');
    if (index !== -1) {
      console.log('Short description HTML fragment:');
      console.log(html.substring(index, index + 500));
    }
    const descIndex = html.indexOf('woocommerce-Tabs-panel--description');
    if (descIndex !== -1) {
      console.log('Description HTML fragment:');
      console.log(html.substring(descIndex, descIndex + 500));
    } else {
      console.log('Description class not found, looking for alternative...');
      const tabIndex = html.indexOf('tab-description');
      if (tabIndex !== -1) {
        console.log(html.substring(tabIndex, tabIndex + 500));
      }
    }
  } catch (err) {
    console.error(err);
  }
}
test();
