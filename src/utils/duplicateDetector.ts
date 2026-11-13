import { Product } from '../types';

export interface DuplicateRecord {
  id: string;
  canonicalProduct: Product;
  duplicateProduct: Product;
  confidence: number; // 0 to 1
  reason: string;
  status: 'confirmed_removed' | 'potential_pending' | 'admin_merged' | 'admin_dismissed';
  detectedAt: string;
}

export interface DuplicateReport {
  scannedAt: string;
  totalProductsScanned: number;
  confirmedCount: number;
  potentialCount: number;
  records: DuplicateRecord[];
}

const STORAGE_REPORT_KEY = 'sjj_duplicate_report_v1';
const STORAGE_DISMISSED_KEY = 'sjj_dismissed_duplicates_v1';

/**
 * Normalizes a text string for comparison (lowercased, removes punctuation, trims spaces)
 */
export function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts a core image identifier from a URL path, stripping extensions and hash prefixes
 */
export function extractImageSignature(imagePath: string): string {
  if (!imagePath) return '';
  // Strip folder path and extension, then strip trailing random upload hash suffix (e.g. _c4448a0b)
  // while preserving camera timestamps like IMG_20261113_075512 or Instagram IDs like 865418338_1794451764205964
  const filename = imagePath.split('/').pop() || '';
  const withoutExt = filename.replace(/\.[^/.]+$/, '');
  const parts = withoutExt.split('_');
  if (parts.length >= 2 && /^[a-f0-9]{6,12}$/i.test(parts[parts.length - 1])) {
    return parts.slice(0, -1).join('_');
  }
  return withoutExt;
}

/**
 * Compares two products and calculates a similarity score [0 - 1] and reason
 */
export function compareProducts(
  p1: Product,
  p2: Product
): { similarity: number; reason: string; isConfirmed: boolean } {
  // Case 1: Exact same image URL -> 100% Confirmed Duplicate
  if (p1.image && p2.image && p1.image === p2.image) {
    return {
      similarity: 1.0,
      reason: 'Identical image file path detected across multiple catalogue records.',
      isConfirmed: true,
    };
  }

  // Case 2: Same image signature (different crop, resize, or hash suffix)
  const sig1 = extractImageSignature(p1.image);
  const sig2 = extractImageSignature(p2.image);
  if (sig1 && sig2 && sig1 === sig2) {
    return {
      similarity: 0.95,
      reason: 'Matching perceptual image signature (same source photo with different compression/filename).',
      isConfirmed: true,
    };
  }

  // Case 3: Same Product ID (case-insensitive)
  if (p1.id.toLowerCase() === p2.id.toLowerCase()) {
    return {
      similarity: 1.0,
      reason: 'Identical Product ID detected.',
      isConfirmed: true,
    };
  }

  // Case 4: Identical normalized title + same category + same selling price
  const name1 = normalizeText(p1.name);
  const name2 = normalizeText(p2.name);
  if (name1 === name2 && p1.primaryCategory === p2.primaryCategory && p1.sellingPrice === p2.sellingPrice) {
    return {
      similarity: 0.92,
      reason: 'Identical product name, matching category, and identical selling price.',
      isConfirmed: true,
    };
  }

  // Case 5: Extremely high title text similarity + same category
  if (p1.primaryCategory === p2.primaryCategory) {
    const words1 = new Set(name1.split(' '));
    const words2 = new Set(name2.split(' '));
    const intersection = [...words1].filter((w) => words2.has(w));
    const union = new Set([...words1, ...words2]);
    const jaccard = union.size > 0 ? intersection.length / union.size : 0;

    if (jaccard >= 0.8 && p1.sellingPrice === p2.sellingPrice) {
      return {
        similarity: 0.75,
        reason: `High title vocabulary overlap (${Math.round(jaccard * 100)}%) with identical selling price.`,
        isConfirmed: false, // Flag for Admin Review per Safety Rule §1.C
      };
    }
  }

  return { similarity: 0, reason: '', isConfirmed: false };
}

/**
 * Runs duplicate detection across all products.
 * Confirmed duplicates are automatically removed (keeping the canonical version).
 * Potential duplicates are flagged for admin review.
 */
export function runDuplicateDetection(
  products: Product[],
  options: { autoRemoveConfirmed?: boolean } = { autoRemoveConfirmed: true }
): { cleanProducts: Product[]; report: DuplicateReport } {
  // Load dismissed pairs from storage so admin dismissals are respected
  let dismissedPairs: string[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_DISMISSED_KEY);
    if (raw) dismissedPairs = JSON.parse(raw);
  } catch {
    dismissedPairs = [];
  }

  const records: DuplicateRecord[] = [];
  const removedIds = new Set<string>();
  const cleanProducts: Product[] = [];

  for (let i = 0; i < products.length; i++) {
    const p1 = products[i];
    if (removedIds.has(p1.id)) continue;

    for (let j = i + 1; j < products.length; j++) {
      const p2 = products[j];
      if (removedIds.has(p2.id)) continue;

      const pairKey = [p1.id, p2.id].sort().join('::');
      if (dismissedPairs.includes(pairKey)) continue;

      const comparison = compareProducts(p1, p2);

      if (comparison.similarity >= 0.7) {
        if (comparison.isConfirmed) {
          // Canonical selection rule: Retain one original product record with verified ID
          // Prefer earlier record or approved record
          const canonical = p1.approvalStatus === 'Approved' ? p1 : p2;
          const duplicate = canonical.id === p1.id ? p2 : p1;

          if (options.autoRemoveConfirmed) {
            removedIds.add(duplicate.id);
          }

          records.push({
            id: `dup-${Date.now()}-${i}-${j}`,
            canonicalProduct: canonical,
            duplicateProduct: duplicate,
            confidence: comparison.similarity,
            reason: comparison.reason,
            status: options.autoRemoveConfirmed ? 'confirmed_removed' : 'potential_pending',
            detectedAt: new Date().toISOString(),
          });
        } else {
          // Safety Rule §1.C: Mark as Potential Duplicate — Admin Review Required
          records.push({
            id: `pot-${Date.now()}-${i}-${j}`,
            canonicalProduct: p1,
            duplicateProduct: p2,
            confidence: comparison.similarity,
            reason: `${comparison.reason} (Marked for Admin Review per Safety Rule §1.C)`,
            status: 'potential_pending',
            detectedAt: new Date().toISOString(),
          });
        }
      }
    }

    if (!removedIds.has(p1.id)) {
      cleanProducts.push(p1);
    }
  }

  const report: DuplicateReport = {
    scannedAt: new Date().toISOString(),
    totalProductsScanned: products.length,
    confirmedCount: records.filter((r) => r.status === 'confirmed_removed').length,
    potentialCount: records.filter((r) => r.status === 'potential_pending').length,
    records,
  };

  try {
    localStorage.setItem(STORAGE_REPORT_KEY, JSON.stringify(report));
  } catch {
    // ignore
  }

  return { cleanProducts, report };
}

/**
 * Dismisses a potential duplicate so it won't be flagged again
 */
export function dismissDuplicatePair(idA: string, idB: string): void {
  const pairKey = [idA, idB].sort().join('::');
  try {
    const raw = localStorage.getItem(STORAGE_DISMISSED_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(pairKey)) {
      list.push(pairKey);
      localStorage.setItem(STORAGE_DISMISSED_KEY, JSON.stringify(list));
    }
  } catch {
    // ignore
  }
}

/**
 * Retrieves the latest stored duplicate report
 */
export function getStoredDuplicateReport(): DuplicateReport | null {
  try {
    const raw = localStorage.getItem(STORAGE_REPORT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}
