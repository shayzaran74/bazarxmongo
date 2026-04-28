const sharp = require('sharp');
const fs = require('fs');

async function test() {
  try {
    console.log('Sharp version:', sharp.versions);
    const buffer = fs.readFileSync('apps/backend/package.json'); // Use any file as input
    // This will fail because package.json is not an image, but it should fail with an image error, not a binary error
    await sharp(buffer).stats();
    console.log('Sharp is working');
  } catch (err) {
    console.error('Sharp error:', err.message);
  }
}

test();
