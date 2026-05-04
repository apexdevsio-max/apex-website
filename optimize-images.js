const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public', 'images');
const images = ['Apex_logo.png', 'robot_mascot.png'];

async function optimizeImage(imageName) {
  const inputPath = path.join(imagesDir, imageName);
  const outputPath = path.join(imagesDir, imageName.replace('.png', '.webp'));

  try {
    await sharp(inputPath)
      .webp({ quality: 80 }) // ضغط جيد
      .toFile(outputPath);
    console.log(`Converted ${imageName} to WebP`);
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