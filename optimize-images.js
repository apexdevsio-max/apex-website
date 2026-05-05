const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public', 'images');
const images = ['Apex_logo.png', 'robot_mascot.png'];

// Add aggressive optimization for hero logo
async function optimizeHeroLogo() {
  const inputPath = path.join(imagesDir, 'Apex_logo.png');
  const outputPath = path.join(imagesDir, 'Apex_logo.webp');
  
  await sharp(inputPath)
    .resize(384, 142, { 
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: true 
    })
    .webp({ quality: 60, effort: 6 })
    .toFile(outputPath);
  console.log('Optimized Apex_logo.webp to 384x142 @60q');
}

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
  await optimizeHeroLogo();
  for (const image of images) {
    await optimizeImage(image);
  }
}

main();