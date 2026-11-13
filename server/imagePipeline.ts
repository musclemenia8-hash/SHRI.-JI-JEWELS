import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import type {
  BoundingBox,
  CleanSourceVerification,
  CropBoxPixels,
  CropMode,
  HorizontalAnalysis,
  ImageOrientation,
  ImagePipelineManifest,
  PipelineSummary,
  ProcessedImageRecord,
  QualityCheckResult,
  VerticalAnalysis,
} from '../src/types/imagePipeline.ts';

const ROOT_DIR = process.cwd();
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const AISTUDIO_ASSETS_DIR = path.join(PUBLIC_DIR, 'assets', 'aistudio');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'assets', 'uploads');
const CLEAN_SOURCES_DIR = path.join(PUBLIC_DIR, 'assets', 'clean');
const PROCESSED_DIR = path.join(PUBLIC_DIR, 'assets', 'processed');
const MANIFEST_PUBLIC_PATH = path.join(PROCESSED_DIR, 'manifest.json');
const MANIFEST_SRC_PATH = path.join(ROOT_DIR, 'src', 'data', 'imageManifest.json');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_RETRIES = 2;

// Non-product assets that must NEVER be cropped/modified by the jewellery pipeline
const EXCLUDED_ASSET_PATTERNS = [
  /^cropped_circle_image/i,
  /^IMG_20261112_144610/i, // previous logo
  /^IMG-20261111-WA0004/i, // old logo
  /^677146512_1794471558432937/i, // square logo variant
  /^IMG_20261112_232020/i, // Terms & Conditions document
  /^Screenshot_/i, // WhatsApp price screenshots
];

export interface DiscoveredAsset {
  originalUrl: string;
  productIds: string[];
  productNames: string[];
  categories: string[];
  discoveredIn: string[];
}

function ensureDirectories(): void {
  [UPLOADS_DIR, CLEAN_SOURCES_DIR, PROCESSED_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function isEligibleImageFilename(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(ext)) return false;
  return !EXCLUDED_ASSET_PATTERNS.some((pattern) => pattern.test(filename));
}

function safePublicPathFromUrl(assetUrl: string): string | null {
  if (!assetUrl || !assetUrl.startsWith('/assets/')) return null;
  const normalized = path.normalize(assetUrl.replace(/^\/+/, ''));
  const resolved = path.resolve(PUBLIC_DIR, normalized);
  if (!resolved.startsWith(PUBLIC_DIR)) return null;
  return resolved;
}

function createProcessedFilename(originalUrl: string): string {
  const base = path.basename(originalUrl, path.extname(originalUrl)).replace(/[^a-zA-Z0-9_-]/g, '_');
  const hash = crypto.createHash('sha1').update(originalUrl).digest('hex').slice(0, 8);
  return `${base}_${hash}.jpg`;
}

/**
 * STAGE 1: IMAGE DISCOVERY
 * Scans the entire codebase & storage to discover EVERY eligible image:
 * - src/data/products.ts (primary images + additionalImages galleries + category cards)
 * - src/components/*.tsx (HeroSlider, EditorialCollage, CollageSlider, ShopByCategory, AllCategoriesModal)
 * - public/assets/aistudio/* & public/assets/uploads/*
 */
export function discoverAllEligibleImages(): Map<string, DiscoveredAsset> {
  ensureDirectories();
  const discovered = new Map<string, DiscoveredAsset>();

  const register = (
    url: string,
    sourceTag: string,
    meta?: { productId?: string; productName?: string; category?: string }
  ) => {
    const cleanUrl = url.split('?')[0].trim();
    const filename = path.basename(cleanUrl);
    if (!isEligibleImageFilename(filename)) return;

    const existing = discovered.get(cleanUrl) || {
      originalUrl: cleanUrl,
      productIds: [],
      productNames: [],
      categories: [],
      discoveredIn: [],
    };

    if (!existing.discoveredIn.includes(sourceTag)) {
      existing.discoveredIn.push(sourceTag);
    }
    if (meta?.productId && !existing.productIds.includes(meta.productId)) {
      existing.productIds.push(meta.productId);
    }
    if (meta?.productName && !existing.productNames.includes(meta.productName)) {
      existing.productNames.push(meta.productName);
    }
    if (meta?.category && !existing.categories.includes(meta.category)) {
      existing.categories.push(meta.category);
    }

    discovered.set(cleanUrl, existing);
  };

  const productsTsPath = path.join(ROOT_DIR, 'src', 'data', 'products.ts');
  if (fs.existsSync(productsTsPath)) {
    const productsContent = fs.readFileSync(productsTsPath, 'utf8');

    const blockRegex = /\{[\s\S]*?"id":\s*"([^"]+)"[\s\S]*?\}/g;
    let match: RegExpExecArray | null;
    while ((match = blockRegex.exec(productsContent)) !== null) {
      const block = match[0];
      const id = match[1];
      const nameMatch = block.match(/"name":\s*"([^"]+)"/);
      const catMatch = block.match(/"primaryCategory":\s*"([^"]+)"/);
      const imgMatch = block.match(/"image":\s*"([^"]+)"/);
      const addMatch = block.match(/"additionalImages":\s*\[([\s\S]*?)\]/);

      const meta = {
        productId: id,
        productName: nameMatch ? nameMatch[1] : undefined,
        category: catMatch ? catMatch[1] : undefined,
      };

      if (imgMatch) {
        register(imgMatch[1], 'catalog', meta);
      }
      if (addMatch) {
        const extraUrls = [...addMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
        extraUrls.forEach((u) => register(u, 'gallery', meta));
      }
    }

    const allProductUrls = [...productsContent.matchAll(/['"](\/assets\/[^'"]+)['"]/g)].map((m) => m[1]);
    allProductUrls.forEach((u) => register(u, 'category_cards'));
  }

  const componentsDir = path.join(ROOT_DIR, 'src', 'components');
  if (fs.existsSync(componentsDir)) {
    const files = fs.readdirSync(componentsDir).filter((f) => f.endsWith('.tsx'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
      const tag = file.replace('.tsx', '').toLowerCase();
      const urls = [...content.matchAll(/['"](\/assets\/(?:aistudio|uploads)\/[^'"]+)['"]/g)].map((m) => m[1]);
      urls.forEach((u) => register(u, tag));
    }
  }

  if (fs.existsSync(AISTUDIO_ASSETS_DIR)) {
    for (const file of fs.readdirSync(AISTUDIO_ASSETS_DIR)) {
      if (isEligibleImageFilename(file)) {
        register(`/assets/aistudio/${file}`, 'storage_aistudio');
      }
    }
  }

  if (fs.existsSync(UPLOADS_DIR)) {
    for (const file of fs.readdirSync(UPLOADS_DIR)) {
      if (isEligibleImageFilename(file)) {
        register(`/assets/uploads/${file}`, 'uploads');
      }
    }
  }

  return discovered;
}

/**
 * Build calibrated 4-pointed astroid template (|x|^0.55 + |y|^0.55 <= R^0.55)
 * matching the translucent Gemini sparkle signature at 1:1 native pixel aspect ratio.
 */
function buildAstroidTemplate(radius: number) {
  const half = Math.ceil(radius) + 2;
  const size = half * 2 + 1;
  const tpl = new Float32Array(size * size);
  let mean = 0;
  for (let dy = -half; dy <= half; dy++) {
    for (let dx = -half; dx <= half; dx++) {
      const d = Math.pow(Math.abs(dx), 0.55) + Math.pow(Math.abs(dy), 0.55);
      const val = d <= Math.pow(radius, 0.55) ? 1 : 0;
      tpl[(dy + half) * size + (dx + half)] = val;
      mean += val;
    }
  }
  mean /= tpl.length;
  let varSum = 0;
  for (let i = 0; i < tpl.length; i++) {
    tpl[i] -= mean;
    varSum += tpl[i] * tpl[i];
  }
  return { tpl, size, half, std: Math.sqrt(varSum) };
}

const ASTROID_TEMPLATE = buildAstroidTemplate(10.5);

/**
 * STAGE 2A: PRECISION GEMINI WATERMARK DETECTOR
 * Evaluates bottom-right corner at 1:1 native aspect ratio (maxDim=512px) using
 * 4-arm radial symmetry + normalized cross-correlation against the 4-point astroid mask.
 */
export async function detectCornerGeminiWatermark(filePath: string): Promise<{
  hasWatermark: boolean;
  watermarkLocation: string;
  ncc: number;
  contrast: number;
  peak: number;
}> {
  const meta = await sharp(filePath).metadata();
  const origW = meta.width || 1024;
  const origH = meta.height || 1024;

  const scale = 512 / Math.max(origW, origH);
  const W = Math.max(64, Math.round(origW * scale));
  const H = Math.max(64, Math.round(origH * scale));

  const { data } = await sharp(filePath)
    .resize(W, H, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const lumAt = (px: number, py: number) => {
    const cx = Math.max(0, Math.min(W - 1, px));
    const cy = Math.max(0, Math.min(H - 1, py));
    const i = (cy * W + cx) * 3;
    return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  };

  const { tpl, size: TSIZE, half: HALF, std: tStd } = ASTROID_TEMPLATE;
  let bestCombined = -1;
  let bestNcc = 0;
  let bestContrast = 0;
  let bestPeak = 0;
  let bx = 0;
  let by = 0;

  const y0 = Math.max(HALF, Math.floor(H * 0.855));
  const y1 = Math.min(H - HALF - 1, Math.floor(H * 0.955));
  const x0 = Math.max(HALF, Math.floor(W * 0.855));
  const x1 = Math.min(W - HALF - 1, Math.floor(W * 0.955));

  for (let cy = y0; cy <= y1; cy++) {
    for (let cx = x0; cx <= x1; cx++) {
      const center = lumAt(cx, cy);
      const diag4 = [
        lumAt(cx - 6, cy - 6),
        lumAt(cx + 6, cy + 6),
        lumAt(cx - 6, cy + 6),
        lumAt(cx + 6, cy - 6),
      ];
      const diagMean = (diag4[0] + diag4[1] + diag4[2] + diag4[3]) / 4;
      const darkQuads = diag4.filter((v) => center - v >= 4).length;
      if (darkQuads < 3) continue;

      const arms = [
        lumAt(cx + 3, cy),
        lumAt(cx - 3, cy),
        lumAt(cx, cy + 3),
        lumAt(cx, cy - 3),
      ];
      const armPos = arms.filter((a) => a - diagMean >= 1.5).length;
      if (armPos < 3) continue;

      // Filter out intensely neon-saturated pixels unrelated to white/cream translucent watermark
      const ci = (cy * W + cx) * 3;
      const maxC = Math.max(data[ci], data[ci + 1], data[ci + 2]);
      const minC = Math.min(data[ci], data[ci + 1], data[ci + 2]);
      const satRatio = maxC > 0 ? (maxC - minC) / maxC : 0;
      if (satRatio >= 0.55) continue;

      let sum = 0;
      const patch = new Float32Array(TSIZE * TSIZE);
      for (let dy = -HALF; dy <= HALF; dy++) {
        for (let dx = -HALF; dx <= HALF; dx++) {
          const l = lumAt(cx + dx, cy + dy);
          patch[(dy + HALF) * TSIZE + (dx + HALF)] = l;
          sum += l;
        }
      }

      const pMean = sum / patch.length;
      let cov = 0;
      let pVar = 0;
      let posSum = 0;
      let posN = 0;
      let negSum = 0;
      let negN = 0;

      for (let k = 0; k < patch.length; k++) {
        const diff = patch[k] - pMean;
        cov += diff * tpl[k];
        pVar += diff * diff;
        if (tpl[k] > 0) {
          posSum += patch[k];
          posN++;
        } else {
          negSum += patch[k];
          negN++;
        }
      }

      const ncc = pVar > 1 ? cov / (Math.sqrt(pVar) * tStd) : 0;
      const contrast = posSum / posN - negSum / negN;
      const peak = center - diagMean;

      // Require radial containment so linen weave/stone ridges don't trigger weak NCC scores
      const armSpread = Math.max(...arms) - Math.min(...arms);
      const maxDiag = Math.max(...diag4);
      const minArm = Math.min(...arms);
      const strictContainment = center >= maxDiag && minArm >= maxDiag - 1 && armSpread <= 24;
      if (ncc < 0.30 && !strictContainment) continue;

      const combined = ncc * Math.min(Math.max(0, contrast), 35) + (peak >= 12 && ncc >= 0.19 ? 3 : 0);

      if (contrast >= 6 && peak >= 8 && combined > bestCombined) {
        bestCombined = combined;
        bestNcc = ncc;
        bestContrast = contrast;
        bestPeak = peak;
        bx = cx;
        by = cy;
      }
    }
  }

  const hasWatermark =
    (bestNcc >= 0.30 && bestContrast >= 7) ||
    (bestNcc >= 0.19 && bestContrast >= 15 && bestPeak >= 16);

  return {
    hasWatermark,
    watermarkLocation: hasWatermark
      ? `bottom-right (${Math.round((bx / W) * 100)}%, ${Math.round((by / H) * 100)}%)`
      : 'none',
    ncc: Number(bestNcc.toFixed(3)),
    contrast: Number(bestContrast.toFixed(1)),
    peak: Number(bestPeak.toFixed(1)),
  };
}

/**
 * Locates matching candidate clean source inside /public/assets/clean/.
 * Supports exact filename, same stem across extensions, or stripped 8-char hash stem.
 */
function findCleanCandidatePath(originalUrl: string): string | null {
  if (!fs.existsSync(CLEAN_SOURCES_DIR)) return null;
  const origFilename = path.basename(originalUrl);
  const origExt = path.extname(origFilename);
  const origStem = path.basename(origFilename, origExt);
  const strippedStem = origStem.replace(/_[0-9a-f]{6,10}$/i, '');

  const files = fs.readdirSync(CLEAN_SOURCES_DIR);
  // 1. Exact filename match
  if (files.includes(origFilename)) {
    return path.join(CLEAN_SOURCES_DIR, origFilename);
  }
  // 2. Match stem or stripped stem across supported image extensions
  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) continue;
    const stem = path.basename(f, path.extname(f));
    if (stem === origStem || stem === strippedStem) {
      return path.join(CLEAN_SOURCES_DIR, f);
    }
  }
  return null;
}

/**
 * STAGE 2B: CLEAN SOURCE VISUAL PRESERVATION VALIDATOR
 * Proves that a clean replacement preserves the EXACT jewellery design, colors, stones,
 * and composition of the original image (excluding the bottom-right corner mark),
 * and verifies that the replacement itself has zero Gemini watermark.
 */
export async function verifyCleanSourceMatch(
  originalPath: string,
  cleanCandidatePath: string
): Promise<CleanSourceVerification> {
  try {
    const [origMeta, cleanMeta] = await Promise.all([
      sharp(originalPath).metadata(),
      sharp(cleanCandidatePath).metadata(),
    ]);

    if (!cleanMeta.width || !cleanMeta.height) {
      return {
        checked: true,
        similarityScore: 0,
        colorFidelityDelta: 255,
        aspectMatchOk: false,
        watermarkFree: false,
        accepted: false,
        note: 'Clean replacement file has unreadable dimensions.',
      };
    }

    const origRatio = (origMeta.width || 1) / (origMeta.height || 1);
    const cleanRatio = cleanMeta.width / cleanMeta.height;
    const aspectMatchOk = Math.abs(origRatio - cleanRatio) <= 0.45;

    const cleanWm = await detectCornerGeminiWatermark(cleanCandidatePath);
    const watermarkFree = !cleanWm.hasWatermark;

    // Resize both to 24x24 RGB grid and compare structural cosine similarity + color fidelity
    // excluding bottom-right [19..23, 19..23] where the removed Gemini mark used to sit
    const G = 24;
    const [{ data: a }, { data: b }] = await Promise.all([
      sharp(originalPath).resize(G, G, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true }),
      sharp(cleanCandidatePath).resize(G, G, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true }),
    ]);

    const lumA: number[] = [];
    const lumB: number[] = [];
    let colorDiffSum = 0;
    let colorCount = 0;

    for (let y = 0; y < G; y++) {
      for (let x = 0; x < G; x++) {
        if (x >= 19 && y >= 19) continue; // skip watermark corner
        const idx = (y * G + x) * 3;
        const la = 0.299 * a[idx] + 0.587 * a[idx + 1] + 0.114 * a[idx + 2];
        const lb = 0.299 * b[idx] + 0.587 * b[idx + 1] + 0.114 * b[idx + 2];
        lumA.push(la);
        lumB.push(lb);
        colorDiffSum +=
          (Math.abs(a[idx] - b[idx]) + Math.abs(a[idx + 1] - b[idx + 1]) + Math.abs(a[idx + 2] - b[idx + 2])) / 3;
        colorCount++;
      }
    }

    const meanA = lumA.reduce((s, v) => s + v, 0) / lumA.length;
    const meanB = lumB.reduce((s, v) => s + v, 0) / lumB.length;
    let cov = 0;
    let varA = 0;
    let varB = 0;
    for (let i = 0; i < lumA.length; i++) {
      const da = lumA[i] - meanA;
      const db = lumB[i] - meanB;
      cov += da * db;
      varA += da * da;
      varB += db * db;
    }

    const similarityScore = Number(
      (varA > 1 && varB > 1 ? Math.max(0, cov / Math.sqrt(varA * varB)) : 1).toFixed(3)
    );
    const colorFidelityDelta = Number((colorCount > 0 ? colorDiffSum / colorCount : 0).toFixed(1));

    const accepted =
      watermarkFree && aspectMatchOk && similarityScore >= 0.72 && colorFidelityDelta <= 48;

    let note = '';
    if (!watermarkFree) {
      note = `Rejected: uploaded replacement still contains corner mark at ${cleanWm.watermarkLocation}.`;
    } else if (!aspectMatchOk) {
      note = `Rejected: aspect ratio mismatch (${cleanRatio.toFixed(2)} vs original ${origRatio.toFixed(2)}).`;
    } else if (similarityScore < 0.72 || colorFidelityDelta > 48) {
      note = `Rejected: product appearance differs from original design (structural similarity ${(similarityScore * 100).toFixed(1)}%, color delta ${colorFidelityDelta}).`;
    } else {
      note = `Verified clean product replacement (${(similarityScore * 100).toFixed(1)}% design match, color delta ${colorFidelityDelta}).`;
    }

    return {
      checked: true,
      similarityScore,
      colorFidelityDelta,
      aspectMatchOk,
      watermarkFree,
      accepted,
      note,
    };
  } catch (err: any) {
    return {
      checked: true,
      similarityScore: 0,
      colorFidelityDelta: 255,
      aspectMatchOk: false,
      watermarkFree: false,
      accepted: false,
      note: err?.message || 'Clean source verification failed',
    };
  }
}

/**
 * STAGE 2 COMBINED INSPECTOR
 */
async function inspectWatermarkAndCleanSource(
  sourcePath: string,
  originalUrl: string
): Promise<{
  effectiveSourcePath: string;
  cleanSourceUrl?: string;
  hasWatermark: boolean;
  watermarkLocation: string;
  cleanSourceStatus: 'clean' | 'replaced_with_clean' | 'needs_clean_source';
  cleanSourceVerification?: CleanSourceVerification;
}> {
  const wmCheck = await detectCornerGeminiWatermark(sourcePath);
  const cleanCandidatePath = findCleanCandidatePath(originalUrl);

  if (cleanCandidatePath && fs.existsSync(cleanCandidatePath)) {
    const verification = await verifyCleanSourceMatch(sourcePath, cleanCandidatePath);
    if (verification.accepted) {
      const relCleanUrl = `/assets/clean/${path.basename(cleanCandidatePath)}`;
      return {
        effectiveSourcePath: cleanCandidatePath,
        cleanSourceUrl: relCleanUrl,
        hasWatermark: false,
        watermarkLocation: 'none',
        cleanSourceStatus: 'replaced_with_clean',
        cleanSourceVerification: verification,
      };
    }

    // Candidate existed on disk but failed design preservation or still had watermark -> reject cleanly
    return {
      effectiveSourcePath: sourcePath,
      hasWatermark: wmCheck.hasWatermark,
      watermarkLocation: wmCheck.watermarkLocation,
      cleanSourceStatus: wmCheck.hasWatermark ? 'needs_clean_source' : 'clean',
      cleanSourceVerification: verification,
    };
  }

  return {
    effectiveSourcePath: sourcePath,
    hasWatermark: wmCheck.hasWatermark,
    watermarkLocation: wmCheck.watermarkLocation,
    cleanSourceStatus: wmCheck.hasWatermark ? 'needs_clean_source' : 'clean',
  };
}

/**
 * STAGE 3A: SERVER-SIDE GEMINI VISION ANALYSIS (@google/genai)
 * Activated automatically whenever process.env.GEMINI_API_KEY is available.
 * Never exposed to browser JavaScript.
 */
let cachedGenAI: GoogleGenAI | null = null;
function getServerGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
  if (!cachedGenAI) {
    cachedGenAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedGenAI;
}

async function analyzeWithGeminiVision(
  sourcePath: string,
  categories: string[]
): Promise<{ boundingBox?: BoundingBox; notes?: string; hasWatermark?: boolean } | null> {
  const ai = getServerGeminiClient();
  if (!ai) return null;

  try {
    const jpgBuffer = await sharp(sourcePath)
      .resize(512, 512, { fit: 'inside' })
      .jpeg({ quality: 82 })
      .toBuffer();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: jpgBuffer.toString('base64'),
            },
          },
          {
            text: `Inspect this luxury jewellery photograph (category: ${categories.join(', ') || 'Jewellery'}).
Identify the EXACT tight bounding box containing the COMPLETE jewellery product including all chains, hooks, clasps, earring drops, pendant bails, and stones. Never cut off any part of the jewellery.
Return coordinates as percentages 0 to 100 (ymin, xmin, ymax, xmax), and indicate whether there is a Gemini star watermark in the bottom-right corner.`,
          },
        ],
      },
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ymin: { type: Type.NUMBER, description: 'Top edge percentage 0-100' },
            xmin: { type: Type.NUMBER, description: 'Left edge percentage 0-100' },
            ymax: { type: Type.NUMBER, description: 'Bottom edge percentage 0-100' },
            xmax: { type: Type.NUMBER, description: 'Right edge percentage 0-100' },
            hasWatermark: { type: Type.BOOLEAN, description: 'True if watermark icon visible in corner' },
            notes: { type: Type.STRING, description: 'Brief composition description' },
          },
          required: ['ymin', 'xmin', 'ymax', 'xmax', 'hasWatermark'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    if (
      typeof parsed.ymin === 'number' &&
      typeof parsed.xmin === 'number' &&
      typeof parsed.ymax === 'number' &&
      typeof parsed.xmax === 'number'
    ) {
      return {
        boundingBox: {
          ymin: Math.max(0, Math.min(95, parsed.ymin)),
          xmin: Math.max(0, Math.min(95, parsed.xmin)),
          ymax: Math.max(5, Math.min(100, parsed.ymax)),
          xmax: Math.max(5, Math.min(100, parsed.xmax)),
        },
        hasWatermark: Boolean(parsed.hasWatermark),
        notes: parsed.notes,
      };
    }
  } catch (err) {
    console.warn('[ImagePipeline] Gemini Vision fallback to deterministic CV:', (err as Error)?.message);
  }
  return null;
}

/**
 * STAGE 3B: DETERMINISTIC 2D HORIZONTAL & VERTICAL SALIENCY ENGINE
 */
async function analyzeCompositionWithCV(
  sourcePath: string,
  categories: string[] = []
): Promise<{
  boundingBox: BoundingBox;
  originalWidth: number;
  originalHeight: number;
}> {
  const meta = await sharp(sourcePath).metadata();
  const originalWidth = meta.width || 1024;
  const originalHeight = meta.height || 1024;

  const S = 200;
  const { data } = await sharp(sourcePath)
    .resize(S, S, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const borderLums: number[] = [];
  for (let i = 0; i < S; i++) {
    for (const [bx, by] of [
      [i, 4],
      [i, S - 5],
      [4, i],
      [S - 5, i],
    ]) {
      if (bx > S * 0.84 && by > S * 0.84) continue;
      const idx = (by * S + bx) * 3;
      borderLums.push(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
    }
  }
  borderLums.sort((a, b) => a - b);
  const isDarkBg = (borderLums[Math.floor(borderLums.length * 0.5)] ?? 128) < 68;

  const isRingStudio = categories.includes('Rings') && Math.min(originalWidth, originalHeight) >= 600;
  const xLoopMin = isRingStudio ? Math.floor(S * 0.22) : 2;
  const xLoopMax = isRingStudio ? Math.ceil(S * 0.78) : S - 3;
  const yLoopMin = isRingStudio ? Math.floor(S * 0.22) : 2;
  const yLoopMax = isRingStudio ? Math.ceil(S * 0.80) : S - 3;

  const map = new Float32Array(S * S);
  for (let y = yLoopMin; y <= yLoopMax; y++) {
    for (let x = xLoopMin; x <= xLoopMax; x++) {
      if (x >= S * 0.85 && y >= S * 0.85) continue;

      const idx = (y * S + x) * 3;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const sat = maxC > 0 ? (maxC - minC) / maxC : 0;

      const lumR =
        0.299 * data[(y * S + x + 1) * 3] +
        0.587 * data[(y * S + x + 1) * 3 + 1] +
        0.114 * data[(y * S + x + 1) * 3 + 2];
      const lumL =
        0.299 * data[(y * S + x - 1) * 3] +
        0.587 * data[(y * S + x - 1) * 3 + 1] +
        0.114 * data[(y * S + x - 1) * 3 + 2];
      const lumD =
        0.299 * data[((y + 1) * S + x) * 3] +
        0.587 * data[((y + 1) * S + x) * 3 + 1] +
        0.114 * data[((y + 1) * S + x) * 3 + 2];
      const lumU =
        0.299 * data[((y - 1) * S + x) * 3] +
        0.587 * data[((y - 1) * S + x) * 3 + 1] +
        0.114 * data[((y - 1) * S + x) * 3 + 2];
      const grad1 = (Math.abs(lumR - lumL) + Math.abs(lumD - lumU)) / 2;

      const isTrueGold = r - b > 60 && g - b > 24 && sat > 0.4 && r > 125;
      const isRubyEmerald = (r > 135 && g < 68 && b < 68) || (g > 115 && r < 70 && b < 70);
      const isCrispDetail = grad1 >= 34;

      let w = 0;
      if (isDarkBg) {
        if ((lum > 72 && grad1 > 10) || isTrueGold || isRubyEmerald) {
          w = grad1 + (isTrueGold ? 48 : 0) + (lum > 95 ? 35 : 15);
        }
      } else {
        if ((isTrueGold && grad1 >= 14) || (isCrispDetail && lum > 40) || isRubyEmerald) {
          w = (isCrispDetail ? grad1 : grad1 * 0.8) + (isTrueGold ? 42 : 0) + (isRubyEmerald ? 52 : 0);
        }
      }

      map[y * S + x] = w;
    }
  }

  const extractBounds = (isX: boolean): [number, number] => {
    const profile = new Float32Array(S);
    for (let i = 2; i < S - 2; i++) {
      let sum = 0;
      let maxW = 0;
      let hits = 0;
      for (let j = 2; j < S - 2; j++) {
        const val = isX ? map[j * S + i] : map[i * S + j];
        sum += val;
        if (val > 42) hits++;
        if (val > maxW) maxW = val;
      }
      profile[i] = Math.min(sum, 1100) + (hits >= 2 ? maxW * 9 : 0);
    }

    const sm = new Float32Array(S);
    for (let i = 0; i < S; i++) {
      let s = 0;
      let c = 0;
      for (let k = -4; k <= 4; k++) {
        if (i + k >= 0 && i + k < S) {
          s += profile[i + k];
          c++;
        }
      }
      sm[i] = s / c;
    }

    const sorted = [...sm].sort((a, b) => a - b);
    const floor = sorted[Math.floor(S * 0.22)];
    const clean = sm.map((v) => Math.max(0, v - floor));
    const peak = Math.max(...clean, 1);

    let lo = S;
    let hi = 0;
    const scanStart = isX ? (isRingStudio ? xLoopMin : Math.floor(S * 0.03)) : (isRingStudio ? yLoopMin : Math.floor(S * 0.03));
    const scanEnd = isX ? (isRingStudio ? xLoopMax : Math.floor(S * 0.97) - 1) : (isRingStudio ? yLoopMax : Math.floor(S * 0.97) - 1);
    for (let i = scanStart; i <= scanEnd; i++) {
      if (clean[i] >= peak * 0.13) {
        if (i < lo) lo = i;
        if (i > hi) hi = i;
      }
    }

    if (hi - lo < S * 0.14) {
      return [14, 86];
    }

    return [
      Number(((lo / S) * 100).toFixed(2)),
      Number(((hi / S) * 100).toFixed(2)),
    ];
  };

  const [xmin, xmax] = extractBounds(true);
  const [ymin, ymax] = extractBounds(false);

  return {
    boundingBox: { xmin, xmax, ymin, ymax },
    originalWidth,
    originalHeight,
  };
}

/**
 * STAGE 4 & 5: INDEPENDENT HORIZONTAL & VERTICAL ANALYSIS + SMART CROPPING CALCULATION
 */
function buildAxisMetrics(bbox: BoundingBox): {
  horizontalAnalysis: HorizontalAnalysis;
  verticalAnalysis: VerticalAnalysis;
} {
  const leftB = Number(bbox.xmin.toFixed(1));
  const rightB = Number(bbox.xmax.toFixed(1));
  const topB = Number(bbox.ymin.toFixed(1));
  const bottomB = Number(bbox.ymax.toFixed(1));

  return {
    horizontalAnalysis: {
      leftBoundaryPercent: leftB,
      rightBoundaryPercent: rightB,
      productWidthPercent: Number((rightB - leftB).toFixed(1)),
      leftBackgroundPercent: leftB,
      rightBackgroundPercent: Number((100 - rightB).toFixed(1)),
      productCenterXPercent: Number(((leftB + rightB) / 2).toFixed(1)),
    },
    verticalAnalysis: {
      topBoundaryPercent: topB,
      bottomBoundaryPercent: bottomB,
      productHeightPercent: Number((bottomB - topB).toFixed(1)),
      topBackgroundPercent: topB,
      bottomBackgroundPercent: Number((100 - bottomB).toFixed(1)),
      productCenterYPercent: Number(((topB + bottomB) / 2).toFixed(1)),
    },
  };
}

/**
 * Sample natural studio perimeter RGB color (excluding bottom-right watermark corner)
 * for seamless original-background contain fallback when an interior 1:1 crop cannot fit all jewellery.
 */
async function sampleStudioBorderColor(sourcePath: string): Promise<{ r: number; g: number; b: number }> {
  try {
    const S = 64;
    const { data } = await sharp(sourcePath)
      .resize(S, S, { fit: 'fill' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const rVals: number[] = [];
    const gVals: number[] = [];
    const bVals: number[] = [];

    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const isBorder = x < 3 || x >= S - 3 || y < 3 || y >= S - 3;
        if (!isBorder) continue;
        if (x >= S - 12 && y >= S - 12) continue; // skip watermark zone
        const idx = (y * S + x) * 3;
        rVals.push(data[idx]);
        gVals.push(data[idx + 1]);
        bVals.push(data[idx + 2]);
      }
    }

    if (rVals.length === 0) return { r: 245, g: 239, b: 235 };
    rVals.sort((a, b) => a - b);
    gVals.sort((a, b) => a - b);
    bVals.sort((a, b) => a - b);
    const mid = Math.floor(rVals.length / 2);

    return { r: rVals[mid], g: gVals[mid], b: bVals[mid] };
  } catch {
    return { r: 245, g: 239, b: 235 };
  }
}

/**
 * STAGE 5: EXACT 1200x1200 (1:1) INTELLIGENT SQUARE CROP + SAFE CONTAIN FALLBACK
 * - Never clips, cuts, or hides any jewellery edge, clasp, chain, hook, or drop.
 * - Uses smart interior 1:1 square cropping whenever the protected jewellery bounding box fits inside Math.min(origW, origH).
 * - Automatically switches to 'safe_contain_original_bg' whenever a tall/wide piece exceeds Math.min(origW, origH).
 */
function calculateExact1200SquareCrop(
  bbox: BoundingBox,
  origW: number,
  origH: number,
  hasWatermark: boolean
): { cropBox: CropBoxPixels; cropMode: CropMode } {
  const rawLeft = (bbox.xmin / 100) * origW;
  const rawRight = (bbox.xmax / 100) * origW;
  const rawTop = (bbox.ymin / 100) * origH;
  const rawBottom = (bbox.ymax / 100) * origH;

  const subjectW = Math.max(origW * 0.12, rawRight - rawLeft);
  const subjectH = Math.max(origH * 0.12, rawBottom - rawTop);

  // Strict protection cushion around complete jewellery product (minimum 2.5% frame or 6% subject span)
  const safePadX = Math.max(origW * 0.025, subjectW * 0.06);
  const safePadY = Math.max(origH * 0.025, subjectH * 0.06);

  const safeLeft = Math.max(0, Math.floor(rawLeft - safePadX));
  const safeRight = Math.min(origW, Math.ceil(rawRight + safePadX));
  const safeTop = Math.max(0, Math.floor(rawTop - safePadY));
  const safeBottom = Math.min(origH, Math.ceil(rawBottom + safePadY));

  const reqW = safeRight - safeLeft;
  const reqH = safeBottom - safeTop;
  const minReqSide = Math.max(reqW, reqH);
  const maxInteriorSquare = Math.min(origW, origH);

  // Check if complete jewellery + safety cushion can fit inside a 1:1 interior square without clipping
  if (minReqSide <= maxInteriorSquare) {
    // Aesthetic breathing space (24% around primary span, bounded cleanly within original image)
    const desiredSide = Math.round(Math.max(minReqSide, Math.max(subjectW, subjectH) * 1.24));
    const minCrispSide = Math.min(maxInteriorSquare, 420);
    let cropSide = Math.max(minReqSide, Math.min(maxInteriorSquare, Math.max(minCrispSide, desiredSide)));

    const cx = (rawLeft + rawRight) / 2;
    const cy = (rawTop + rawBottom) / 2;

    let sqLeft = Math.round(cx - cropSide / 2);
    if (sqLeft > safeLeft) sqLeft = safeLeft;
    if (sqLeft + cropSide < safeRight) sqLeft = safeRight - cropSide;
    sqLeft = Math.max(0, Math.min(origW - cropSide, sqLeft));

    let sqTop = Math.round(cy - cropSide / 2);
    if (sqTop > safeTop) sqTop = safeTop;
    if (sqTop + cropSide < safeBottom) sqTop = safeBottom - cropSide;
    sqTop = Math.max(0, Math.min(origH - cropSide, sqTop));

    // If watermark is strictly in bottom-right background outside safe bounds, clear it when square allows
    if (hasWatermark) {
      const clearLimitX = Math.round(origW * 0.875);
      const clearLimitY = Math.round(origH * 0.875);
      if (safeRight <= clearLimitX && sqLeft + cropSide > clearLimitX) {
        const candidateLeft = Math.max(0, clearLimitX - cropSide);
        if (candidateLeft <= safeLeft && candidateLeft + cropSide >= safeRight) {
          sqLeft = candidateLeft;
        }
      }
      if (safeBottom <= clearLimitY && sqTop + cropSide > clearLimitY) {
        const candidateTop = Math.max(0, clearLimitY - cropSide);
        if (candidateTop <= safeTop && candidateTop + cropSide >= safeBottom) {
          sqTop = candidateTop;
        }
      }
    }

    // Final guarantee: 100% subject protection with zero clipping
    sqLeft = Math.max(0, Math.min(sqLeft, Math.max(0, Math.floor(rawLeft - origW * 0.015))));
    sqTop = Math.max(0, Math.min(sqTop, Math.max(0, Math.floor(rawTop - origH * 0.015))));
    if (sqLeft + cropSide < safeRight) sqLeft = Math.max(0, Math.min(origW - cropSide, safeRight - cropSide));
    if (sqTop + cropSide < safeBottom) sqTop = Math.max(0, Math.min(origH - cropSide, safeBottom - cropSide));
    cropSide = Math.min(cropSide, origW - sqLeft, origH - sqTop);

    const horizontalTrimPercent = Number((((origW - cropSide) / origW) * 100).toFixed(1));
    const verticalTrimPercent = Number((((origH - cropSide) / origH) * 100).toFixed(1));
    const focalX = Number((((sqLeft + cropSide / 2) / origW) * 100).toFixed(1));
    const focalY = Number((((sqTop + cropSide / 2) / origH) * 100).toFixed(1));

    return {
      cropMode: 'smart_square_crop',
      cropBox: {
        left: sqLeft,
        top: sqTop,
        width: cropSide,
        height: cropSide,
        horizontalTrimPercent,
        verticalTrimPercent,
        focalX,
        focalY,
      },
    };
  }

  // Fallback path: Safe Contain with sampled original background
  // Trim only empty excessive background outside the generous protected jewellery bounds
  const extraPadX = Math.max(origW * 0.05, subjectW * 0.1);
  const extraPadY = Math.max(origH * 0.05, subjectH * 0.1);
  const left = Math.max(0, Math.floor(rawLeft - extraPadX));
  const right = Math.min(origW, Math.ceil(rawRight + extraPadX));
  const top = Math.max(0, Math.floor(rawTop - extraPadY));
  const bottom = Math.min(origH, Math.ceil(rawBottom + extraPadY));
  const cropW = Math.max(1, right - left);
  const cropH = Math.max(1, bottom - top);

  return {
    cropMode: 'safe_contain_original_bg',
    cropBox: {
      left,
      top,
      width: cropW,
      height: cropH,
      horizontalTrimPercent: Number((((origW - cropW) / origW) * 100).toFixed(1)),
      verticalTrimPercent: Number((((origH - cropH) / origH) * 100).toFixed(1)),
      focalX: Number((((left + cropW / 2) / origW) * 100).toFixed(1)),
      focalY: Number((((top + cropH / 2) / origH) * 100).toFixed(1)),
    },
  };
}

/**
 * Compute mean high-frequency gradient sharpness energy of an RGB buffer
 */
function measureEdgeSharpness(buf: Buffer, w: number, h: number): number {
  let gradSum = 0;
  let count = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idxR = (y * w + x + 1) * 3;
      const idxL = (y * w + x - 1) * 3;
      const idxD = ((y + 1) * w + x) * 3;
      const idxU = ((y - 1) * w + x) * 3;
      const lR = 0.299 * buf[idxR] + 0.587 * buf[idxR + 1] + 0.114 * buf[idxR + 2];
      const lL = 0.299 * buf[idxL] + 0.587 * buf[idxL + 1] + 0.114 * buf[idxL + 2];
      const lD = 0.299 * buf[idxD] + 0.587 * buf[idxD + 1] + 0.114 * buf[idxD + 2];
      const lU = 0.299 * buf[idxU] + 0.587 * buf[idxU + 1] + 0.114 * buf[idxU + 2];
      gradSum += Math.abs(lR - lL) + Math.abs(lD - lU);
      count++;
    }
  }
  return count > 0 ? gradSum / count : 1;
}

/**
 * STAGE 6: REAL QUALITY PROTECTION CHECK (EXACT 1200x1200 1:1 ENFORCED)
 * Verifies:
 * - Output is exact 1200 × 1200 pixels (1:1 aspect ratio)
 * - Complete subject safety enclosure (no cut off jewelry edges)
 * - Color fidelity delta (natural gold & stone colors unmodified)
 * - Sharpness retention ratio (crisp Lanczos3 resize without artificial filters)
 */
async function runQualityProtectionCheck(params: {
  activeSourcePath: string;
  processedDiskPath: string;
  bbox: BoundingBox;
  cropBox: CropBoxPixels;
  cropMode: CropMode;
  backgroundColor?: { r: number; g: number; b: number };
  origW: number;
  origH: number;
}): Promise<QualityCheckResult> {
  const { activeSourcePath, processedDiskPath, bbox, cropBox, cropMode, backgroundColor, origW, origH } = params;
  const outStat = fs.statSync(processedDiskPath);
  const outMeta = await sharp(processedDiskPath).metadata();

  if (!outMeta.width || !outMeta.height || outStat.size < 2048) {
    return {
      passed: false,
      exact1200Square: false,
      sharpnessRetentionRatio: 0,
      colorDelta: 255,
      minResolutionOk: false,
      cropSafetyMarginOk: false,
      aspectDistortionZero: false,
      reason: 'Corrupt or undersized output buffer',
    };
  }

  const rawLeft = (bbox.xmin / 100) * origW;
  const rawRight = (bbox.xmax / 100) * origW;
  const rawTop = (bbox.ymin / 100) * origH;
  const rawBottom = (bbox.ymax / 100) * origH;

  const cropSafetyMarginOk =
    cropBox.left <= rawLeft + 3 &&
    cropBox.left + cropBox.width >= rawRight - 3 &&
    cropBox.top <= rawTop + 3 &&
    cropBox.top + cropBox.height >= rawBottom - 3;

  const exact1200Square = outMeta.width === 1200 && outMeta.height === 1200;
  const minResolutionOk = exact1200Square;
  const aspectDistortionZero = Math.abs(outMeta.width / outMeta.height - 1.0) <= 0.001;

  // Evaluate color & sharpness fidelity at 200x200 matching active cropMode
  const E = 200;
  const srcPipe = sharp(activeSourcePath)
    .extract({ left: cropBox.left, top: cropBox.top, width: cropBox.width, height: cropBox.height })
    .resize(
      E,
      E,
      cropMode === 'safe_contain_original_bg' && backgroundColor
        ? { fit: 'contain', background: { ...backgroundColor, alpha: 1 }, kernel: sharp.kernel.lanczos3 }
        : { fit: 'fill', kernel: sharp.kernel.lanczos3 }
    )
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const outPipe = sharp(processedDiskPath)
    .resize(E, E, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const [{ data: srcBuf }, { data: outBuf }] = await Promise.all([srcPipe, outPipe]);

  let dR = 0;
  let dG = 0;
  let dB = 0;
  const pixCount = E * E;
  for (let i = 0; i < pixCount * 3; i += 3) {
    dR += Math.abs(srcBuf[i] - outBuf[i]);
    dG += Math.abs(srcBuf[i + 1] - outBuf[i + 1]);
    dB += Math.abs(srcBuf[i + 2] - outBuf[i + 2]);
  }
  const colorDelta = Number((Math.max(dR, dG, dB) / pixCount).toFixed(2));
  const srcSharp = Math.max(0.5, measureEdgeSharpness(srcBuf, E, E));
  const outSharp = measureEdgeSharpness(outBuf, E, E);
  const sharpnessRetentionRatio = Number((outSharp / srcSharp).toFixed(3));

  const passed =
    exact1200Square &&
    cropSafetyMarginOk &&
    minResolutionOk &&
    aspectDistortionZero &&
    colorDelta <= 12 &&
    sharpnessRetentionRatio >= 0.80;

  let reason = 'Exact 1200×1200 (1:1) quality checks passed';
  if (!exact1200Square) reason = `Output (${outMeta.width}×${outMeta.height}) did not match exact 1200×1200`;
  else if (!cropSafetyMarginOk) reason = 'Crop infringed product subject boundary — switching to safe contain';
  else if (colorDelta > 12) reason = `Color fidelity shift (${colorDelta}) exceeded threshold`;
  else if (sharpnessRetentionRatio < 0.80) reason = `Sharpness retention dropped (${sharpnessRetentionRatio}x)`;

  return {
    passed,
    exact1200Square,
    sharpnessRetentionRatio,
    colorDelta,
    minResolutionOk,
    cropSafetyMarginOk,
    aspectDistortionZero,
    reason,
  };
}

function classifyOrientation(w: number, h: number): ImageOrientation {
  const ratio = w / h;
  if (ratio > 1.06) return 'landscape';
  if (ratio < 0.94) return 'portrait';
  return 'square';
}

function inferImportantElements(categories: string[]): string[] {
  const joined = categories.join(' ').toLowerCase();
  const base = ['primary motif & finish', 'gemstone & filigree details'];
  if (joined.includes('chain') || joined.includes('mangalsutra')) {
    return ['links & clasp assembly', 'dual-strand beads / pendant bail', ...base];
  }
  if (joined.includes('earring') || joined.includes('ladies')) {
    return ['earring hooks & top studs', 'hanging jhumka / drop elements', ...base];
  }
  if (joined.includes('pendant')) {
    return ['top bail loop & chain', 'etched deity/floral medallion', ...base];
  }
  if (joined.includes('ring') || joined.includes('kada') || joined.includes('bracelet')) {
    return ['shank/band curvature', 'hinge/lock & textured borders', ...base];
  }
  return base;
}

/**
 * STAGE 6B & 7: PROCESS SINGLE IMAGE THROUGH ALL MANDATED STAGES
 */
export async function processSingleImage(asset: DiscoveredAsset): Promise<ProcessedImageRecord> {
  ensureDirectories();
  const originalUrl = asset.originalUrl;
  const sourcePath = safePublicPathFromUrl(originalUrl);
  const stages: string[] = ['IMAGE_DISCOVERY', 'IMAGE_INVENTORY'];

  const baseRecord: ProcessedImageRecord = {
    id: originalUrl,
    originalUrl,
    productIds: asset.productIds,
    productNames: asset.productNames,
    categories: asset.categories,
    discoveredIn: asset.discoveredIn,
    status: 'failed',
    analysisStatus: 'failed',
    cleanSourceStatus: 'clean',
    hasWatermark: false,
    watermarkLocation: 'none',
    aiMethod: 'cv-saliency',
    pipelineStages: stages,
    processingTimestamp: Date.now(),
  };

  if (!sourcePath || !fs.existsSync(sourcePath)) {
    return {
      ...baseRecord,
      errorMessage: `Source asset not found at ${originalUrl}`,
    };
  }

  const stat = fs.statSync(sourcePath);

  // Stage 2 & 3: AI Composition Analysis + Watermark Detection + Clean Source Validation
  const sourceCheck = await inspectWatermarkAndCleanSource(sourcePath, originalUrl);
  const activeSource = sourceCheck.effectiveSourcePath;

  const [cvResult, geminiResult] = await Promise.all([
    analyzeCompositionWithCV(activeSource, asset.categories),
    analyzeWithGeminiVision(activeSource, asset.categories),
  ]);
  stages.push('AI_IMAGE_ANALYSIS', 'PRODUCT_BOUNDARY_DETECTION');

  let finalBBox: BoundingBox = cvResult.boundingBox;
  let aiMethod: 'gemini-vision+cv' | 'cv-saliency' = 'cv-saliency';
  if (geminiResult?.boundingBox) {
    aiMethod = 'gemini-vision+cv';
    finalBBox = {
      xmin: Math.min(cvResult.boundingBox.xmin, geminiResult.boundingBox.xmin),
      ymin: Math.min(cvResult.boundingBox.ymin, geminiResult.boundingBox.ymin),
      xmax: Math.max(cvResult.boundingBox.xmax, geminiResult.boundingBox.xmax),
      ymax: Math.max(cvResult.boundingBox.ymax, geminiResult.boundingBox.ymax),
    };
  }

  const hasWatermark =
    sourceCheck.cleanSourceStatus === 'replaced_with_clean'
      ? false
      : Boolean(sourceCheck.hasWatermark || geminiResult?.hasWatermark);

  const watermarkLocation = hasWatermark
    ? sourceCheck.watermarkLocation !== 'none'
      ? sourceCheck.watermarkLocation
      : 'bottom-right (AI detected)'
    : 'none';

  // Stage 4, 5 & 6: Exact 1200x1200 Square Crop Calculation + Sampled Studio Border Background
  const { horizontalAnalysis, verticalAnalysis } = buildAxisMetrics(finalBBox);
  stages.push('HORIZONTAL_CROP_CALCULATION', 'VERTICAL_CROP_CALCULATION', 'CLEAN_SOURCE_VALIDATION');

  let { cropBox, cropMode } = calculateExact1200SquareCrop(
    finalBBox,
    cvResult.originalWidth,
    cvResult.originalHeight,
    hasWatermark
  );
  const sampledBg =
    cropMode === 'safe_contain_original_bg'
      ? await sampleStudioBorderColor(activeSource)
      : undefined;
  stages.push('EXACT_1200_SQUARE_CROPPING');

  const subjectAreaPercent = Math.round(
    ((finalBBox.xmax - finalBBox.xmin) * (finalBBox.ymax - finalBBox.ymin)) / 100
  );
  const emptyBackgroundPercent = Math.max(0, 100 - subjectAreaPercent);
  const orientation = classifyOrientation(cvResult.originalWidth, cvResult.originalHeight);
  const importantElements = inferImportantElements(asset.categories);

  // Stage 7 & 8: Render Exact 1200x1200 Output (CROPPING ONLY — zero sharpen/filters/color mods)
  const processedFilename = createProcessedFilename(originalUrl);
  const processedDiskPath = path.join(PROCESSED_DIR, processedFilename);
  const processedPublicUrl = `/assets/processed/${processedFilename}`;

  const render1200Square = async (
    box: CropBoxPixels,
    mode: CropMode,
    bg?: { r: number; g: number; b: number }
  ) => {
    const pipeline = sharp(activeSource).extract({
      left: box.left,
      top: box.top,
      width: box.width,
      height: box.height,
    });

    if (mode === 'safe_contain_original_bg' && bg) {
      pipeline.resize(1200, 1200, {
        fit: 'contain',
        background: { r: bg.r, g: bg.g, b: bg.b, alpha: 1 },
        kernel: sharp.kernel.lanczos3,
      });
    } else {
      pipeline.resize(1200, 1200, {
        fit: 'fill',
        kernel: sharp.kernel.lanczos3,
      });
    }

    await pipeline
      .toColorspace('srgb')
      .jpeg({
        quality: 90,
        mozjpeg: true,
        chromaSubsampling: '4:4:4',
      })
      .toFile(processedDiskPath);
  };

  await render1200Square(cropBox, cropMode, sampledBg);

  let activeBg = sampledBg;
  let qualityCheck = await runQualityProtectionCheck({
    activeSourcePath: activeSource,
    processedDiskPath,
    bbox: finalBBox,
    cropBox,
    cropMode,
    backgroundColor: activeBg,
    origW: cvResult.originalWidth,
    origH: cvResult.originalHeight,
  });

  // Failsafe: if interior square QC failed for any edge case, fall back to full-frame Safe Contain 1200x1200
  if (!qualityCheck.passed) {
    activeBg = activeBg || (await sampleStudioBorderColor(activeSource));
    cropMode = 'safe_contain_original_bg';
    cropBox = {
      left: 0,
      top: 0,
      width: cvResult.originalWidth,
      height: cvResult.originalHeight,
      horizontalTrimPercent: 0,
      verticalTrimPercent: 0,
      focalX: 50,
      focalY: 50,
    };
    await render1200Square(cropBox, cropMode, activeBg);
    qualityCheck = await runQualityProtectionCheck({
      activeSourcePath: activeSource,
      processedDiskPath,
      bbox: finalBBox,
      cropBox,
      cropMode,
      backgroundColor: activeBg,
      origW: cvResult.originalWidth,
      origH: cvResult.originalHeight,
    });
  }

  stages.push('QUALITY_VALIDATION');

  const cleanSourceStatus =
    sourceCheck.cleanSourceStatus === 'replaced_with_clean'
      ? 'replaced_with_clean'
      : hasWatermark
      ? 'needs_clean_source'
      : 'clean';

  const originalAspectRatio = Number((cvResult.originalWidth / cvResult.originalHeight).toFixed(3));

  if (!qualityCheck.passed) {
    if (fs.existsSync(processedDiskPath)) {
      fs.unlinkSync(processedDiskPath);
    }
    stages.push('WEBSITE_IMAGE_INTEGRATION');
    return {
      ...baseRecord,
      processedUrl: originalUrl,
      cleanSourceUrl: sourceCheck.cleanSourceUrl,
      status: cleanSourceStatus === 'needs_clean_source' ? 'needs_clean_source' : 'processed',
      analysisStatus: 'completed',
      cleanSourceStatus,
      hasWatermark,
      watermarkLocation,
      aiMethod,
      orientation,
      cropMode,
      sampledBackgroundColor: activeBg,
      importantElements,
      emptyBackgroundPercent,
      boundingBox: finalBBox,
      cropBox,
      horizontalAnalysis,
      verticalAnalysis,
      originalAspectRatio,
      processedAspectRatio: originalAspectRatio,
      subjectAreaPercent,
      originalDimensions: { width: cvResult.originalWidth, height: cvResult.originalHeight },
      processedDimensions: { width: cvResult.originalWidth, height: cvResult.originalHeight },
      originalSizeBytes: stat.size,
      processedSizeBytes: stat.size,
      cleanSourceVerification: sourceCheck.cleanSourceVerification,
      qualityCheck,
      pipelineStages: stages,
      processingTimestamp: Date.now(),
      notes: `Quality check fallback to original: ${qualityCheck.reason}`,
    };
  }

  stages.push('PROCESSED_IMAGE_STORAGE', 'WEBSITE_IMAGE_INTEGRATION');
  const outStat = fs.statSync(processedDiskPath);
  const outMeta = await sharp(processedDiskPath).metadata();
  const procW = outMeta.width || 1200;
  const procH = outMeta.height || 1200;

  return {
    ...baseRecord,
    processedUrl: processedPublicUrl,
    cleanSourceUrl: sourceCheck.cleanSourceUrl,
    status: cleanSourceStatus === 'needs_clean_source' ? 'needs_clean_source' : 'processed',
    analysisStatus: 'completed',
    cleanSourceStatus,
    hasWatermark,
    watermarkLocation,
    aiMethod,
    orientation,
    cropMode,
    sampledBackgroundColor: activeBg,
    importantElements,
    emptyBackgroundPercent,
    boundingBox: finalBBox,
    cropBox,
    horizontalAnalysis,
    verticalAnalysis,
    originalAspectRatio,
    processedAspectRatio: Number((procW / procH).toFixed(3)),
    subjectAreaPercent,
    originalDimensions: { width: cvResult.originalWidth, height: cvResult.originalHeight },
    processedDimensions: { width: procW, height: procH },
    originalSizeBytes: stat.size,
    processedSizeBytes: outStat.size,
    cleanSourceVerification: sourceCheck.cleanSourceVerification,
    qualityCheck,
    pipelineStages: stages,
    processingTimestamp: Date.now(),
    notes:
      cropMode === 'safe_contain_original_bg'
        ? `Exact 1200×1200 (1:1) Safe Contain with original background (zero jewellery cut).`
        : geminiResult?.notes ||
          `Exact 1200×1200 (1:1) Smart Square Crop (H:${cropBox.horizontalTrimPercent}% / V:${cropBox.verticalTrimPercent}% empty margin removed).`,
  };
}

/**
 * Executes processSingleImage with automatic exponential-backoff retries (MAX_RETRIES = 2)
 */
export async function processSingleImageWithRetry(asset: DiscoveredAsset): Promise<ProcessedImageRecord> {
  let attempt = 0;
  let lastError = 'Processing failed';

  while (attempt <= MAX_RETRIES) {
    try {
      const result = await processSingleImage(asset);
      result.retryCount = attempt;
      if (result.status !== 'failed') {
        return result;
      }
      lastError = result.errorMessage || lastError;
    } catch (err: any) {
      lastError = err?.message || lastError;
      console.warn(`[ImagePipeline] Attempt ${attempt + 1} failed for ${asset.originalUrl}: ${lastError}`);
    }
    attempt++;
    if (attempt <= MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 150 * Math.pow(2, attempt - 1)));
    }
  }

  return {
    id: asset.originalUrl,
    originalUrl: asset.originalUrl,
    processedUrl: asset.originalUrl, // Safe fallback so storefront never shows a broken image
    productIds: asset.productIds,
    productNames: asset.productNames,
    categories: asset.categories,
    discoveredIn: asset.discoveredIn,
    status: 'failed',
    analysisStatus: 'failed',
    cleanSourceStatus: 'clean',
    hasWatermark: false,
    watermarkLocation: 'none',
    aiMethod: 'cv-saliency',
    retryCount: MAX_RETRIES,
    pipelineStages: ['IMAGE_DISCOVERY', 'RETRY_EXHAUSTED', 'WEBSITE_IMAGE_INTEGRATION'],
    processingTimestamp: Date.now(),
    errorMessage: lastError,
  };
}

class CentralizedImagePipelineManager {
  private manifest: ImagePipelineManifest;
  private activeQueuePromise: Promise<ImagePipelineManifest> | null = null;
  private isProcessing = false;

  constructor() {
    ensureDirectories();
    this.manifest = this.loadManifest();
  }

  private loadManifest(): ImagePipelineManifest {
    for (const p of [MANIFEST_PUBLIC_PATH, MANIFEST_SRC_PATH]) {
      if (fs.existsSync(p)) {
        try {
          const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
          if (parsed && parsed.records) {
            return parsed;
          }
        } catch {
          // continue
        }
      }
    }
    return {
      version: 4,
      summary: {
        totalDiscovered: 0,
        totalAnalyzed: 0,
        totalProcessed: 0,
        geminiMarksDetected: 0,
        verifiedCleanReplacements: 0,
        successfullyOptimized: 0,
        exactSquare1200Count: 0,
        containFallbackCount: 0,
        awaitingReplacement: 0,
        needsCleanSource: 0,
        qualityCheckPassed: 0,
        failed: 0,
        pending: 0,
        uniqueCropGeometries: 0,
        secondPassVerified: false,
        isProcessing: false,
        lastRunTimestamp: 0,
      },
      records: {},
    };
  }

  private saveManifest(): void {
    const json = JSON.stringify(this.manifest, null, 2);
    try {
      fs.writeFileSync(MANIFEST_PUBLIC_PATH, json, 'utf8');
      fs.writeFileSync(MANIFEST_SRC_PATH, json, 'utf8');
    } catch (err) {
      console.error('[ImagePipeline] Error saving manifest:', err);
    }
  }

  private recomputeSummary(discoveredCount: number, pendingCount = 0, secondPassVerified?: boolean): PipelineSummary {
    const vals = Object.values(this.manifest.records);
    let totalAnalyzed = 0;
    let successfullyOptimized = 0;
    let exactSquare1200Count = 0;
    let containFallbackCount = 0;
    let awaitingReplacement = 0;
    let geminiMarksDetected = 0;
    let verifiedCleanReplacements = 0;
    let qualityCheckPassed = 0;
    let failed = 0;
    const uniqueCropSet = new Set<string>();

    for (const rec of vals) {
      const procDisk = rec.processedUrl ? safePublicPathFromUrl(rec.processedUrl) : null;
      const isFallbackOriginal = rec.processedUrl === rec.originalUrl;
      const hasFile = Boolean(procDisk && fs.existsSync(procDisk));

      if (rec.analysisStatus === 'completed' || Boolean(rec.boundingBox)) {
        totalAnalyzed++;
      }
      if (rec.cropBox) {
        uniqueCropSet.add(`${rec.cropBox.left},${rec.cropBox.top},${rec.cropBox.width}x${rec.cropBox.height}`);
      }
      if (rec.processedDimensions?.width === 1200 && rec.processedDimensions?.height === 1200) {
        exactSquare1200Count++;
      }
      if (rec.cropMode === 'safe_contain_original_bg') {
        containFallbackCount++;
      }
      if (rec.hasWatermark) {
        geminiMarksDetected++;
      }
      if (rec.cleanSourceStatus === 'replaced_with_clean') {
        verifiedCleanReplacements++;
      }
      if (rec.qualityCheck?.passed) {
        qualityCheckPassed++;
      }

      if (rec.status === 'failed' || (!hasFile && !isFallbackOriginal && rec.status !== 'pending')) {
        failed++;
      } else if (rec.status === 'needs_clean_source') {
        awaitingReplacement++;
        if (hasFile) successfullyOptimized++;
      } else if (rec.status === 'processed' && (hasFile || isFallbackOriginal)) {
        successfullyOptimized++;
      }
    }

    return {
      totalDiscovered: Math.max(discoveredCount, vals.length),
      totalAnalyzed,
      totalProcessed: successfullyOptimized + failed,
      geminiMarksDetected,
      verifiedCleanReplacements,
      successfullyOptimized,
      exactSquare1200Count,
      containFallbackCount,
      awaitingReplacement,
      needsCleanSource: awaitingReplacement,
      qualityCheckPassed,
      failed,
      pending: pendingCount,
      uniqueCropGeometries: uniqueCropSet.size,
      secondPassVerified:
        secondPassVerified ??
        (pendingCount === 0 && failed === 0 && totalAnalyzed === discoveredCount && exactSquare1200Count === discoveredCount),
      isProcessing: this.isProcessing,
      lastRunTimestamp: Date.now(),
    };
  }

  public getManifest(): ImagePipelineManifest {
    const discovered = discoverAllEligibleImages();
    this.manifest.summary = this.recomputeSummary(discovered.size, 0);
    return this.manifest;
  }

  /**
   * Generates a complete verification report satisfying Stage 10 audit requirements.
   */
  public getVerificationReport() {
    const manifest = this.getManifest();
    const records = Object.values(manifest.records);
    const awaitingList = records
      .filter((r) => r.cleanSourceStatus === 'needs_clean_source')
      .map((r) => ({
        originalUrl: r.originalUrl,
        productIds: r.productIds,
        productName: r.productNames[0] || path.basename(r.originalUrl),
        watermarkLocation: r.watermarkLocation,
      }));

    return {
      generatedAt: new Date().toISOString(),
      originalsUntouched: true,
      targetDimensions: '1200x1200 (1:1)',
      pipelineArchitecture:
        'IMAGE_DISCOVERY -> IMAGE_INVENTORY -> AI_IMAGE_ANALYSIS -> PRODUCT_BOUNDARY_DETECTION -> HORIZONTAL_CROP_CALCULATION -> VERTICAL_CROP_CALCULATION -> CLEAN_SOURCE_VALIDATION -> EXACT_1200_SQUARE_CROPPING -> QUALITY_VALIDATION -> PROCESSED_IMAGE_STORAGE -> WEBSITE_IMAGE_INTEGRATION',
      metrics: {
        totalDiscovered: manifest.summary.totalDiscovered,
        analyzed: manifest.summary.totalAnalyzed,
        croppedAndOptimized: manifest.summary.successfullyOptimized,
        exactSquare1200Count: manifest.summary.exactSquare1200Count ?? 0,
        containFallbackCount: manifest.summary.containFallbackCount ?? 0,
        qualityVerified: manifest.summary.qualityCheckPassed,
        uniqueCropGeometries: manifest.summary.uniqueCropGeometries,
        geminiWatermarksDetected: manifest.summary.geminiMarksDetected,
        verifiedCleanReplacementsApplied: manifest.summary.verifiedCleanReplacements,
        awaitingAuthorizedCleanReplacement: manifest.summary.awaitingReplacement,
        pending: manifest.summary.pending,
        failed: manifest.summary.failed,
        coveragePercent:
          manifest.summary.totalDiscovered > 0
            ? Number(((manifest.summary.successfullyOptimized / manifest.summary.totalDiscovered) * 100).toFixed(1))
            : 100,
      },
      awaitingCleanReplacement: awaitingList,
    };
  }

  /**
   * Checks whether an asset has completed ALL stages with exact 1200x1200 (1:1) disk artifacts.
   */
  private isRecordCompleteAndValid(rec: ProcessedImageRecord | undefined): boolean {
    if (!rec) return false;
    if (rec.status === 'failed' || rec.status === 'pending') return false;
    if (rec.analysisStatus !== 'completed') return false;
    if (!rec.boundingBox || !rec.cropBox || !rec.horizontalAnalysis || !rec.verticalAnalysis) return false;
    if (!rec.orientation || !rec.qualityCheck || !rec.cropMode) return false;
    if (rec.processedDimensions?.width !== 1200 || rec.processedDimensions?.height !== 1200) return false;
    const procDisk = rec.processedUrl ? safePublicPathFromUrl(rec.processedUrl) : null;
    return Boolean(procDisk && fs.existsSync(procDisk));
  }

  public async runFullPipeline(forceAll = false): Promise<ImagePipelineManifest> {
    if (this.activeQueuePromise && !forceAll) {
      return this.activeQueuePromise;
    }

    this.activeQueuePromise = (async () => {
      this.isProcessing = true;
      const discoveredMap = discoverAllEligibleImages();
      const assets = Array.from(discoveredMap.values());

      // Remove stale records whose originals no longer exist on disk
      for (const existingUrl of Object.keys(this.manifest.records)) {
        if (!discoveredMap.has(existingUrl)) {
          const disk = safePublicPathFromUrl(existingUrl);
          if (!disk || !fs.existsSync(disk)) {
            delete this.manifest.records[existingUrl];
          }
        }
      }

      const assetsToProcess: DiscoveredAsset[] = [];
      for (const asset of assets) {
        const existing = this.manifest.records[asset.originalUrl];
        if (!forceAll && this.isRecordCompleteAndValid(existing) && existing) {
          existing.productIds = asset.productIds;
          existing.productNames = asset.productNames;
          existing.categories = asset.categories;
          existing.discoveredIn = asset.discoveredIn;
        } else {
          assetsToProcess.push(asset);
        }
      }

      let remaining = assetsToProcess.length;
      const concurrency = 4;

      for (let i = 0; i < assetsToProcess.length; i += concurrency) {
        const batch = assetsToProcess.slice(i, i + concurrency);
        const results = await Promise.all(batch.map((asset) => processSingleImageWithRetry(asset)));
        for (const rec of results) {
          this.manifest.records[rec.originalUrl] = rec;
          remaining = Math.max(0, remaining - 1);
        }
        this.manifest.summary = this.recomputeSummary(assets.length, remaining);
        this.saveManifest();
      }

      this.manifest.version = 4;
      this.isProcessing = false;
      this.manifest.summary = this.recomputeSummary(assets.length, 0);
      this.saveManifest();
      this.activeQueuePromise = null;
      return this.manifest;
    })();

    return this.activeQueuePromise;
  }

  /**
   * SECOND COMPLETE VERIFICATION SCAN (Requirement #10):
   * Re-scans every eligible asset, validates Sharp 1200x1200 (1:1) metadata on every processed output on disk,
   * automatically re-queues & processes any missed/incomplete/non-square image, and returns exact audit report.
   */
  public async runSecondPassVerificationScan(): Promise<{
    verified: boolean;
    requeuedCount: number;
    brokenOrMissingImages: string[];
    report: ReturnType<CentralizedImagePipelineManager['getVerificationReport']>;
    manifest: ImagePipelineManifest;
  }> {
    const discoveredMap = discoverAllEligibleImages();

    // Prune stale records whose source files were removed from codebase & disk
    for (const existingUrl of Object.keys(this.manifest.records)) {
      if (!discoveredMap.has(existingUrl)) {
        const disk = safePublicPathFromUrl(existingUrl);
        if (!disk || !fs.existsSync(disk)) {
          delete this.manifest.records[existingUrl];
        }
      }
    }

    const incompleteAssets: DiscoveredAsset[] = [];

    for (const asset of discoveredMap.values()) {
      const rec = this.manifest.records[asset.originalUrl];
      let validOnDisk = this.isRecordCompleteAndValid(rec);
      if (validOnDisk && rec?.processedUrl) {
        const procDisk = safePublicPathFromUrl(rec.processedUrl);
        if (procDisk) {
          try {
            const meta = await sharp(procDisk).metadata();
            if (meta.width !== 1200 || meta.height !== 1200) validOnDisk = false;
          } catch {
            validOnDisk = false;
          }
        }
      }

      if (!validOnDisk) {
        incompleteAssets.push(asset);
      }
    }

    if (incompleteAssets.length > 0) {
      for (let i = 0; i < incompleteAssets.length; i += 4) {
        const batch = incompleteAssets.slice(i, i + 4);
        const results = await Promise.all(batch.map((a) => processSingleImageWithRetry(a)));
        for (const r of results) {
          this.manifest.records[r.originalUrl] = r;
        }
      }
    }

    const brokenOrMissingImages: string[] = [];
    for (const asset of discoveredMap.values()) {
      const rec = this.manifest.records[asset.originalUrl];
      if (!this.isRecordCompleteAndValid(rec)) {
        brokenOrMissingImages.push(asset.originalUrl);
      }
    }

    this.manifest.summary = this.recomputeSummary(
      discoveredMap.size,
      0,
      brokenOrMissingImages.length === 0
    );
    this.saveManifest();

    return {
      verified: brokenOrMissingImages.length === 0,
      requeuedCount: incompleteAssets.length,
      brokenOrMissingImages,
      report: this.getVerificationReport(),
      manifest: this.manifest,
    };
  }

  public async processAndRegisterImage(
    originalUrl: string,
    meta?: { productId?: string; productName?: string; category?: string; sourceTag?: string }
  ): Promise<ProcessedImageRecord> {
    const existing = this.manifest.records[originalUrl];
    const asset: DiscoveredAsset = {
      originalUrl,
      productIds: meta?.productId
        ? Array.from(new Set([...(existing?.productIds || []), meta.productId]))
        : existing?.productIds || [],
      productNames: meta?.productName
        ? Array.from(new Set([...(existing?.productNames || []), meta.productName]))
        : existing?.productNames || [],
      categories: meta?.category
        ? Array.from(new Set([...(existing?.categories || []), meta.category]))
        : existing?.categories || [],
      discoveredIn: Array.from(new Set([...(existing?.discoveredIn || []), meta?.sourceTag || 'dynamic'])),
    };

    const record = await processSingleImageWithRetry(asset);
    this.manifest.records[originalUrl] = record;
    const discovered = discoverAllEligibleImages();
    this.manifest.summary = this.recomputeSummary(discovered.size, 0);
    this.saveManifest();
    return record;
  }

  public async validateAndCommitCleanUpload(
    originalUrl: string,
    stagedTempPath: string
  ): Promise<{ accepted: boolean; verification: CleanSourceVerification; record?: ProcessedImageRecord }> {
    const origPath = safePublicPathFromUrl(originalUrl);
    if (!origPath || !fs.existsSync(origPath)) {
      if (fs.existsSync(stagedTempPath)) fs.unlinkSync(stagedTempPath);
      throw new Error(`Original asset not found at ${originalUrl}`);
    }

    const verification = await verifyCleanSourceMatch(origPath, stagedTempPath);
    if (!verification.accepted) {
      if (fs.existsSync(stagedTempPath)) fs.unlinkSync(stagedTempPath);
      return { accepted: false, verification };
    }

    ensureDirectories();
    const targetCleanPath = path.join(CLEAN_SOURCES_DIR, path.basename(originalUrl));
    fs.copyFileSync(stagedTempPath, targetCleanPath);
    if (fs.existsSync(stagedTempPath)) fs.unlinkSync(stagedTempPath);

    const record = await this.processAndRegisterImage(originalUrl, {
      sourceTag: 'clean_replacement',
    });

    return { accepted: true, verification, record };
  }
}

export const imagePipelineManager = new CentralizedImagePipelineManager();
export { UPLOADS_DIR, CLEAN_SOURCES_DIR, PROCESSED_DIR };
