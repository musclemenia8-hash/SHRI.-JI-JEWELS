import { Product } from '../types';

export interface QualityAuditResult {
  productId: string;
  productName: string;
  qualityScore: number; // 0 - 100
  titleCompliant: boolean;
  titleIssues: string[];
  descriptionCompliant: boolean;
  descriptionIssues: string[];
  flaggedPuffery: string[];
  flaggedFakeClaims: string[];
  suggestedTitle: string;
  suggestedDescription: string;
}

export interface CatalogueAuditSummary {
  auditedAt: string;
  totalProducts: number;
  averageScore: number;
  compliantCount: number;
  needsReviewCount: number;
  results: QualityAuditResult[];
}

// Words considered exaggerated promotional fluff on Flipkart/Myntra
const FORBIDDEN_PUFFERY = [
  'royal majesty',
  'imperial charm',
  'divine splendour',
  'luxury king',
  'emperor collection',
  'supreme lord',
  'opulent grandeur',
  'majestic radiance',
  'king of kings',
  'royal crown',
  'sovereign majesty'
];

// Unverified / invented metal or gemstone purity claims that must be omitted
const FORBIDDEN_FAKE_CLAIMS = [
  '24k solid gold',
  '24 karat solid gold',
  'pure gold bar',
  'solid 22k gold',
  'vvs1 diamond',
  'natural certified diamond',
  'hallmark 916 certified',
  'certified diamond',
  'genuine diamond solitaire',
  'certified gemstone',
  'unconditional lifetime warranty'
];

/**
 * Generates a clean, professional Flipkart/Myntra standard title for any product.
 * Format: [Audience]'s [Material/Finish] [Design Style] [Product Type]
 */
export function generateFlipkartMyntraTitle(product: Product): string {
  const audience = product.audience || 'Unisex';
  const prefix = audience === 'Unisex' ? 'Unisex' : `${audience}'s`;

  // Determine clean product type
  let type = product.productType || '';
  if (!type || type.toLowerCase().includes('royal')) {
    if (product.primaryCategory === 'Chains') type = 'Chain';
    else if (product.primaryCategory === 'Rings') type = 'Ring';
    else if (product.primaryCategory === 'Kada') type = 'Kada';
    else if (product.primaryCategory === 'Bracelets') type = 'Bracelet';
    else if (product.primaryCategory === 'Pendants') type = 'Pendant';
    else if (product.primaryCategory === 'Earrings') type = 'Earrings';
    else if (product.primaryCategory === 'Ladies Sets') type = 'Necklace Set';
    else if (product.primaryCategory === 'Mangalsutra') type = 'Mangalsutra';
  }

  // Remove puffery from existing name to extract core motif
  let coreName = product.name;
  FORBIDDEN_PUFFERY.forEach((puff) => {
    const reg = new RegExp(puff, 'gi');
    coreName = coreName.replace(reg, '');
  });

  // Strip existing prefix if repeated
  coreName = coreName
    .replace(/^Men's\s+/i, '')
    .replace(/^Women's\s+/i, '')
    .replace(/^Unisex\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  // If already clean, ensure audience prefix is standard
  if (!coreName.toLowerCase().startsWith('gold tone') && !coreName.toLowerCase().includes('gold')) {
    return `${prefix} Gold Tone ${coreName}`;
  }

  return `${prefix} ${coreName}`;
}

/**
 * Generates a clean, customer-friendly Flipkart/Myntra description.
 */
export function generateFlipkartMyntraDescription(product: Product): string {
  // Strip any puffery or fake purity claims
  let cleanDesc = product.description;
  FORBIDDEN_PUFFERY.forEach((puff) => {
    const reg = new RegExp(puff, 'gi');
    cleanDesc = cleanDesc.replace(reg, '');
  });
  FORBIDDEN_FAKE_CLAIMS.forEach((claim) => {
    const reg = new RegExp(claim, 'gi');
    cleanDesc = cleanDesc.replace(reg, 'radiant gold finish');
  });

  cleanDesc = cleanDesc.replace(/\s+/g, ' ').trim();

  // If description is too brief or empty, provide standard professional copy
  if (cleanDesc.length < 25) {
    if (product.primaryCategory === 'Chains') {
      return `Traditional Indian gold-tone neck chain with smooth interlocking links and secure clasp. Comfortable for daily wear and festive celebrations.`;
    }
    if (product.primaryCategory === 'Rings') {
      return `Classic gold-tone signet band ring with smooth inner shank for everyday comfort. Designed with durable alloy core and high-radiance polish.`;
    }
    if (product.primaryCategory === 'Kada') {
      return `Traditional Indian gold-tone kada pair with fine embossed detailing. Styled for weddings, festivals, and traditional family functions.`;
    }
    if (product.primaryCategory === 'Bracelets') {
      return `Modern gold-tone link bracelet with secure box clasp and polished link edges. Suitable for both casual and formal ethnic attire.`;
    }
    if (product.primaryCategory === 'Pendants') {
      return `Detailed gold-tone pendant crafted with sacred traditional motifs. Supplied ready to wear with matching neck chain.`;
    }
    if (product.primaryCategory === 'Earrings') {
      return `Comfortable gold-tone huggie earrings featuring sparkling stone accents and secure click clasp for all-day comfort.`;
    }
    if (product.primaryCategory === 'Ladies Sets') {
      return `Regal gold-tone bridal necklace set featuring matching chandelier earrings with intricate meenakari and stone embellishments.`;
    }
    if (product.primaryCategory === 'Mangalsutra') {
      return `Auspicious gold-tone mangalsutra with dual-strand black beads and handcrafted floral pendant for enduring marital grace.`;
    }
  }

  return cleanDesc;
}

/**
 * Audits a single product against Flipkart/Myntra listing standards.
 */
export function auditProductListing(product: Product): QualityAuditResult {
  const titleIssues: string[] = [];
  const descriptionIssues: string[] = [];
  const flaggedPuffery: string[] = [];
  const flaggedFakeClaims: string[] = [];

  const lowerTitle = product.name.toLowerCase();
  const lowerDesc = product.description.toLowerCase();

  // Check title length
  if (product.name.trim().length < 8) {
    titleIssues.push('Title is too brief or truncated.');
  } else if (product.name.trim().length > 90) {
    titleIssues.push('Title exceeds recommended marketplace character length (90 chars).');
  }

  // Check audience prefix
  const hasAudience =
    product.name.startsWith("Men's") ||
    product.name.startsWith("Women's") ||
    product.name.startsWith("Unisex");
  if (!hasAudience) {
    titleIssues.push("Title lacks clear audience specification (e.g. Men's, Women's, or Unisex).");
  }

  // Check forbidden puffery in title and description
  FORBIDDEN_PUFFERY.forEach((puff) => {
    if (lowerTitle.includes(puff)) {
      flaggedPuffery.push(`Title contains exaggerated puffery: "${puff}"`);
      titleIssues.push(`Remove puffery phrase "${puff}".`);
    }
    if (lowerDesc.includes(puff)) {
      flaggedPuffery.push(`Description contains exaggerated puffery: "${puff}"`);
      descriptionIssues.push(`Remove puffery phrase "${puff}".`);
    }
  });

  // Check forbidden fake claims
  FORBIDDEN_FAKE_CLAIMS.forEach((claim) => {
    if (lowerTitle.includes(claim) || lowerDesc.includes(claim)) {
      flaggedFakeClaims.push(`Contains unverified purity/specification claim: "${claim}"`);
      descriptionIssues.push(`Remove unverified claim "${claim}". Use "gold tone" or "gold finish" instead.`);
    }
  });

  // Check description quality
  if (product.description.trim().length < 30) {
    descriptionIssues.push('Description is too short to be informative for customers.');
  }

  // Calculate Quality Score
  let score = 100;
  score -= titleIssues.length * 15;
  score -= descriptionIssues.length * 10;
  score -= flaggedPuffery.length * 20;
  score -= flaggedFakeClaims.length * 30;
  score = Math.max(0, Math.min(100, score));

  return {
    productId: product.id,
    productName: product.name,
    qualityScore: score,
    titleCompliant: titleIssues.length === 0,
    titleIssues,
    descriptionCompliant: descriptionIssues.length === 0,
    descriptionIssues,
    flaggedPuffery,
    flaggedFakeClaims,
    suggestedTitle: generateFlipkartMyntraTitle(product),
    suggestedDescription: generateFlipkartMyntraDescription(product),
  };
}

/**
 * Audits the entire catalogue and provides aggregate statistics
 */
export function auditCatalogue(products: Product[]): CatalogueAuditSummary {
  const results = products.map((p) => auditProductListing(p));
  const totalScore = results.reduce((acc, r) => acc + r.qualityScore, 0);
  const compliantCount = results.filter((r) => r.qualityScore >= 85).length;

  return {
    auditedAt: new Date().toISOString(),
    totalProducts: products.length,
    averageScore: results.length ? Math.round(totalScore / results.length) : 100,
    compliantCount,
    needsReviewCount: products.length - compliantCount,
    results,
  };
}
