import sharp from 'sharp';
import path from 'path';

const imagesDir = path.join(__dirname, 'public', 'images');
const images = ['Apex_logo.png', 'robot_mascot.png'];

// Add aggressive optimization for hero logo
async function optimizeHeroLogo() {
  const inputPath = path.join(imagesDir, 'Apex_logo.png');
  
  // WebP optimized
  await sharp(inputPath)
    .resize(384, 142, { 
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: true 
    })
    .webp({ quality: 50, effort: 6 })
    .toFile(path.join(imagesDir, 'Apex_logo.webp'));
  console.log('Optimized Apex_logo.webp: 384x142 @50q');
  
  // AVIF for max savings
  await sharp(inputPath)
    .resize(384, 142, { 
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: true 
    })
    .avif({ quality: 45, effort: 6 })
    .toFile(path.join(imagesDir, 'Apex_logo.avif'));
  console.log('Optimized Apex_logo.avif: 384x142 @45q');
}

async function optimizeImage(imageName) {
  const inputPath = path.join(imagesDir, imageName);
  const webpPath = path.join(imagesDir, imageName.replace('.png', '.webp'));
  const avifPath = path.join(imagesDir, imageName.replace('.png', '.avif'));

  try {
    // WebP for hero mascot
    await sharp(inputPath)
      .webp({ quality: 60, effort: 6 })
      .toFile(webpPath);
    console.log(`Optimized ${imageName} to WebP @60q`);

    // AVIF
    await sharp(inputPath)
      .avif({ quality: 55, effort: 6 })
      .toFile(avifPath);
    console.log(`Optimized ${imageName} to AVIF @55q`);
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