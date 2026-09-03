import { copyFile, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceDir = path.join(root, "pics");
const outDir = path.join(root, "public", "imgs");

const images = [
  {
    input: "hero.png",
    name: "hero",
    widths: [640, 960, 1280, 1672],
    quality: { avif: 48, webp: 78 }
  },
  {
    input: "heromobile.png",
    name: "hero-mobile",
    widths: [390, 640, 941],
    quality: { avif: 48, webp: 78 }
  },
  {
    input: "projekt1.png",
    name: "projekt1",
    widths: [520, 760, 1080, 1448],
    quality: { avif: 50, webp: 80 }
  },
  {
    input: "projekt2Alpindach.png",
    name: "projekt2",
    widths: [520, 760, 1080, 1448],
    quality: { avif: 50, webp: 80 }
  },
  {
    input: "projekt3fdabdichtung.png",
    name: "projekt3",
    widths: [520, 760, 1080, 1448],
    quality: { avif: 50, webp: 80 }
  }
];

await mkdir(outDir, { recursive: true });
for (const file of await readdir(outDir)) {
  if (file !== ".gitkeep") {
    await rm(path.join(outDir, file), { force: true, recursive: true });
  }
}
await copyFile(path.join(sourceDir, "fermax-logo.svg"), path.join(outDir, "fermax-logo.svg"));

const compactLogo = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="236" height="104" viewBox="16 44 118 52" role="img" aria-labelledby="title desc">
  <title id="title">FERMAX</title>
  <desc id="desc">Kompakte FERMAX-Wortmarke aus der vorhandenen Vektorgrafik.</desc>
  <g fill="none" stroke-linecap="square" stroke-linejoin="miter">
    <g id="frame" stroke="#697071" stroke-width="0.62">
      <path d="M41.45 58.25H21.05V95.05H57.3"/>
      <path d="M108.55 57.5H128.45V95.05H92.35"/>
    </g>
    <g id="roof-secondary" stroke="#73797b" stroke-width="0.8">
      <path d="M50.85 67.45L74.9 55.55"/>
      <path d="M65.8 49.8L85.55 63.85"/>
    </g>
    <path id="roof-primary" d="M35.35 75.3L50.2 57.65L65.2 74.5" stroke="#191d1e" stroke-width="1.02"/>
    <path id="roof-accent" d="M75.45 61.2H123.1" stroke="#36b2c0" stroke-width="1.07"/>
    <g id="wordmark" stroke="#15191b" stroke-width="1.1">
      <path id="letter-f" d="M33.55 91.2V82.15H44M33.55 86.75H42.9"/>
      <path id="letter-e" d="M57.3 82.15H46.95V91.2H57.3M46.95 86.7H56.45"/>
      <path id="letter-r" d="M60.5 91.2V82.15H69.2Q71.25 82.15 71.25 84.1V84.95Q71.25 86.8 69.2 86.8H60.5M66.2 87.15L71.25 91.2"/>
      <path id="letter-m" fill="#15191b" stroke="none" d="M74.45 91.75V81.6H75.3L80.7 89.03L86.08 81.6H86.9V91.75H85.8V84.01L80.7 91.02L75.55 84.01V91.75Z"/>
      <path id="letter-a" d="M89.15 91.2L95.15 82.15L101.2 91.2M91.35 87.9H98.9"/>
      <path id="letter-x" d="M105.75 82.15L115.25 91.2M115.25 82.15L105.75 91.2" stroke="#36b2c0"/>
    </g>
  </g>
</svg>
`;

await writeFile(path.join(outDir, "fermax-wordmark.svg"), compactLogo, "utf8");

for (const image of images) {
  const input = path.join(sourceDir, image.input);
  for (const width of image.widths) {
    const base = sharp(input).resize({ width, withoutEnlargement: true });
    await base.clone().avif({ quality: image.quality.avif, effort: 6 }).toFile(path.join(outDir, `${image.name}-${width}.avif`));
    await base.clone().webp({ quality: image.quality.webp, effort: 5 }).toFile(path.join(outDir, `${image.name}-${width}.webp`));
  }
}

const ogSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#15191B" stop-opacity="0.88"/>
      <stop offset="0.56" stop-color="#15191B" stop-opacity="0.44"/>
      <stop offset="1" stop-color="#15191B" stop-opacity="0.12"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#shade)"/>
  <rect x="76" y="78" width="120" height="5" fill="#36B2C0"/>
  <text x="76" y="180" font-family="Arial, Helvetica, sans-serif" font-size="76" font-weight="780" fill="#FFFFFF">FERMAX KG</text>
  <text x="76" y="255" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="680" fill="#F5F4F0">Bauwerksabdichtung in Linz</text>
  <text x="76" y="510" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="700" fill="#36B2C0">office@fermax.at - +43 664 4638568</text>
</svg>`;

const hero = sharp(path.join(sourceDir, "hero.png"))
  .resize({ width: 1200, height: 630, fit: "cover", position: "center" });
const overlay = Buffer.from(ogSvg);

await hero.composite([{ input: overlay, left: 0, top: 0 }]).png({ quality: 90 }).toFile(path.join(outDir, "og.png"));

const appleSvg = `
<svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" rx="28" fill="#15191B"/>
  <path d="M42 90L67 60L93 89" fill="none" stroke="#F5F4F0" stroke-width="9" stroke-linecap="square" stroke-linejoin="miter"/>
  <path d="M86 66H143" fill="none" stroke="#36B2C0" stroke-width="9" stroke-linecap="square"/>
  <path d="M105 112L139 145M139 112L105 145" fill="none" stroke="#36B2C0" stroke-width="10" stroke-linecap="square"/>
</svg>`;

await sharp(Buffer.from(appleSvg)).png().toFile(path.join(outDir, "apple-touch-icon.png"));

console.log(`Optimized ${images.length} source images into ${outDir}`);
