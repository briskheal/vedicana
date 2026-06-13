import fs from 'fs';
async function fetchImages() {
  try {
    const res = await fetch('http://localhost:3000/api/admin/discover/images');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
fetchImages();
