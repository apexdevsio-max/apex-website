const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public', 'images');
const images = ['Apex_logo.png', 'robot_mascot.png'];

async function optimizeImage(imageName) {
  const inputPath = path.join(imagesDir, imageName);
  const webpPath = path.join(imagesDir, imageName.replace('.png', '.webp'));
  const avifPath = path.join(imagesDir, imageName.replace('.png', '.avif'));

  try {
    // تحويل إلى WebP مع ضغط أعلى
    await sharp(inputPath)
      .webp({ quality: 85, effort: 6 })
      .toFile(webpPath);
    console.log(`Converted ${imageName} to WebP`);

    // تحويل إلى AVIF لتوفير أكبر
    await sharp(inputPath)
      .avif({ quality: 80, effort: 6 })
      .toFile(avifPath);
    console.log(`Converted ${imageName} to AVIF`);
  } catch (error) {
    console.error(`Error converting ${imageName}:`, error);
  }
}

async function main() {
  for (const image of images) {
    await optimizeImage(image);
  }
}

main();