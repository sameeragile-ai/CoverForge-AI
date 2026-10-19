import { TypographyConfig } from '../types';

/**
 * Composites the background cover image with the live typography overlay
 * onto an offscreen HTML5 canvas at full print resolution (1200x1800 px, 6x9 ratio)
 * and triggers a crisp PNG download.
 */
export async function exportCompositeCover(
  imageUrl: string,
  title: string,
  subtitle: string,
  authorName: string,
  typography: TypographyConfig,
  filename: string = 'book-cover.png'
): Promise<void> {
  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = 1800; // standard 6x9 high-res ratio
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not supported');
  }

  // Load and draw background image
  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load cover image'));
    img.src = imageUrl;
  });

  ctx.drawImage(img, 0, 0, width, height);

  // Setup text rendering defaults
  ctx.textAlign = 'center';

  // 1. Render Subtitle (if enabled)
  if (typography.showSubtitle && subtitle) {
    const subY = (typography.subtitleY / 100) * height;
    const subFontSize = (typography.subtitleSize / 100) * 80;
    ctx.font = `600 ${subFontSize}px "${typography.subtitleFont}", sans-serif`;
    ctx.fillStyle = typography.subtitleColor;

    if (typography.shadowBlur > 0) {
      ctx.shadowColor = typography.shadowColor;
      ctx.shadowBlur = typography.shadowBlur * 1.5;
    } else {
      ctx.shadowBlur = 0;
    }

    if (typography.strokeWidth > 0) {
      ctx.strokeStyle = typography.strokeColor;
      ctx.lineWidth = typography.strokeWidth * 1.5;
      ctx.strokeText(subtitle, width / 2, subY);
    }
    ctx.fillText(subtitle, width / 2, subY);
  }

  // 2. Render Main Title
  const titleY = (typography.titleY / 100) * height;
  const titleFontSize = (typography.titleSize / 100) * 160;
  const formattedTitle =
    typography.titleCase === 'uppercase'
      ? title.toUpperCase()
      : typography.titleCase === 'capitalize'
      ? title.replace(/\b\w/g, (c) => c.toUpperCase())
      : title;

  ctx.font = `800 ${titleFontSize}px "${typography.titleFont}", sans-serif`;
  ctx.fillStyle = typography.titleColor;

  if (typography.shadowBlur > 0) {
    ctx.shadowColor = typography.shadowColor;
    ctx.shadowBlur = typography.shadowBlur * 2.5;
    ctx.shadowOffsetY = 6;
  }

  if (typography.strokeWidth > 0) {
    ctx.strokeStyle = typography.strokeColor;
    ctx.lineWidth = typography.strokeWidth * 2;
    ctx.strokeText(formattedTitle, width / 2, titleY);
  }
  ctx.fillText(formattedTitle, width / 2, titleY);

  // 3. Render Author Name
  const authorY = (typography.authorY / 100) * height;
  const authorFontSize = (typography.authorSize / 100) * 90;
  ctx.font = `700 ${authorFontSize}px "${typography.authorFont}", sans-serif`;
  ctx.fillStyle = typography.authorColor;

  if (typography.shadowBlur > 0) {
    ctx.shadowColor = typography.shadowColor;
    ctx.shadowBlur = typography.shadowBlur * 1.5;
    ctx.shadowOffsetY = 3;
  }

  if (typography.strokeWidth > 0) {
    ctx.strokeStyle = typography.strokeColor;
    ctx.lineWidth = typography.strokeWidth * 1.5;
    ctx.strokeText(authorName.toUpperCase(), width / 2, authorY);
  }
  ctx.fillText(authorName.toUpperCase(), width / 2, authorY);

  // Trigger download
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
