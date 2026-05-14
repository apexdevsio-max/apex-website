import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, 'public', 'images');
const images = ['Apex_logo.png', 'robot_mascot.png'];

async function optimizeHeroLogo() {
  const inputPath = path.join(imagesDir, 'Apex_logo.png');

  await sharp(inputPath)
    .resize(220, 72, { kernel: 'lanczos3', withoutEnlargement: true })
    .webp({ quality: 35, effort: 6 })
    .toFile(path.join(imagesDir, 'Apex_logo.webp'));

  await sharp(inputPath)
    .resize(220, 72, { kernel: 'lanczos3', withoutEnlargement: true })
    .avif({ quality: 30, effort: 6 })
    .toFile(path.join(imagesDir, 'Apex_logo.avif'));
}

async function optimizeImage(imageName) {
  const inputPath = path.join(imagesDir, imageName);

  await sharp(inputPath)
    .resize(400, 400, { fit: 'inside', kernel: 'lanczos3', withoutEnlargement: true })
    .webp({ quality: 50, effort: 6 })
    .toFile(path.join(imagesDir, imageName.replace('.png', '.webp')));

  await sharp(inputPath)
    .resize(400, 400, { fit: 'inside', kernel: 'lanczos3', withoutEnlargement: true })
    .avif({ quality: 45, effort: 6 })
    .toFile(path.join(imagesDir, imageName.replace('.png', '.avif')));
}

async function main() {
  await optimizeHeroLogo();
  for (const image of images) {
    await optimizeImage(image);
  }
}

main();
