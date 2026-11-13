import { Product, CategoryType } from '../types';

export interface PriceRangeRule {
  category: CategoryType;
  subType?: string;
  minPrice: number;
  maxPrice: number;
  isFixed?: boolean;
  label: string;
}

export const APPROVED_PRICING_RULES: Record<string, PriceRangeRule> = {
  'Pendants': {
    category: 'Pendants',
    minPrice: 800,
    maxPrice: 900,
    label: '₹800 – ₹900',
  },
  'Chains_Thin': {
    category: 'Chains',
    subType: 'Thin',
    minPrice: 1400,
    maxPrice: 1600,
    label: '₹1,400 – ₹1,600 (Fine Design)',
  },
  'Chains_Thick': {
    category: 'Chains',
    subType: 'Thick',
    minPrice: 2400,
    maxPrice: 2600,
    label: '₹2,400 – ₹2,600 (Statement Design)',
  },
  'Rings': {
    category: 'Rings',
    minPrice: 1400,
    maxPrice: 1500,
    label: '₹1,400 – ₹1,500',
  },
  'Kada': {
    category: 'Kada',
    minPrice: 1500,
    maxPrice: 1500,
    isFixed: true,
    label: '₹1,500 (Fixed)',
  },
  'Ladies Sets': {
    category: 'Ladies Sets',
    minPrice: 2800,
    maxPrice: 3200,
    label: '₹2,800 – ₹3,200',
  },
  'Mangalsutra': {
    category: 'Mangalsutra',
    minPrice: 1400,
    maxPrice: 1500,
    label: '₹1,400 – ₹1,500',
  },
  'Earrings': {
    category: 'Earrings',
    minPrice: 1400,
    maxPrice: 1500,
    label: '₹1,400 – ₹1,500',
  },
  'Bracelets': {
    category: 'Bracelets',
    minPrice: 1500,
    maxPrice: 1600,
    label: '₹1,500 – ₹1,600',
  },
};

/**
 * Classify a chain into Thin or Thick based on link pattern, weight, and visual attributes
 */
export function classifyChainThickness(product: {
  name: string;
  description?: string;
  productType?: string;
  chainThickness?: 'Thin' | 'Thick';
}): 'Thin' | 'Thick' {
  if (product.chainThickness) {
    return product.chainThickness;
  }

  const text = `${product.name} ${product.productType || ''} ${product.description || ''}`.toLowerCase();

  // Statement / Bold link indicators
  const thickKeywords = [
    'heavy',
    'byzantine',
    'cuban curb',
    'cuban',
    'rope',
    'franco',
    'bold',
    'solid',
    'nawabi',
    'broad',
    'triple row',
    'dense',
    's-scroll',
    'braided',
    'parallel',
    'double-loop',
    'ribbed',
    'statement',
  ];

  // Fine / Delicate link indicators
  const thinKeywords = [
    'sleek',
    'delicate',
    'flat mesh',
    'snake',
    'herringbone',
    'box',
    'bead',
    'satellite',
    'cable',
    'lightweight',
    'capsule',
    'maa',
    'rose',
    'marquise',
    'filigree',
    'fine',
  ];

  const hasThick = thickKeywords.some(kw => text.includes(kw));
  const hasThin = thinKeywords.some(kw => text.includes(kw));

  if (hasThick && !hasThin) return 'Thick';
  if (hasThin && !hasThick) return 'Thin';

  // Default heuristic for chains
  if (text.includes('byzantine') || text.includes('parallel') || text.includes('braided')) {
    return 'Thick';
  }
  return 'Thin';
}

/**
 * Look up the exact pricing rule that applies to a given product
 */
export function getPricingRuleForProduct(product: Product): PriceRangeRule {
  if (product.primaryCategory === 'Chains') {
    const thickness = classifyChainThickness(product);
    return thickness === 'Thick'
      ? APPROVED_PRICING_RULES['Chains_Thick']
      : APPROVED_PRICING_RULES['Chains_Thin'];
  }

  if (APPROVED_PRICING_RULES[product.primaryCategory]) {
    return APPROVED_PRICING_RULES[product.primaryCategory];
  }

  // Fallback for custom or accessory categories
  return {
    category: product.primaryCategory,
    minPrice: 1000,
    maxPrice: 2000,
    label: '₹1,000 – ₹2,000',
  };
}

/**
 * Validate that product selling price strictly conforms to approved pricing rules
 */
export function validateProductPrice(product: Product): {
  isValid: boolean;
  expectedMin: number;
  expectedMax: number;
  ruleLabel: string;
  diff: number;
} {
  const rule = getPricingRuleForProduct(product);
  const isValid = product.sellingPrice >= rule.minPrice && product.sellingPrice <= rule.maxPrice;
  const diff = isValid
    ? 0
    : product.sellingPrice < rule.minPrice
    ? rule.minPrice - product.sellingPrice
    : product.sellingPrice - rule.maxPrice;

  return {
    isValid,
    expectedMin: rule.minPrice,
    expectedMax: rule.maxPrice,
    ruleLabel: rule.label,
    diff,
  };
}

/**
 * Automatically adjust a product's price to the approved matrix
 */
export function enforceApprovedPrice(product: Product): Product {
  const rule = getPricingRuleForProduct(product);
  let price = product.sellingPrice;

  if (rule.isFixed) {
    price = rule.minPrice;
  } else if (price < rule.minPrice || price > rule.maxPrice) {
    // Choose appropriate price point in range
    price = Math.round((rule.minPrice + rule.maxPrice) / 2 / 50) * 50;
  }

  // Derive original price 25-35% higher
  const originalPrice = Math.round((price * 1.35) / 100) * 100;
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

  const thickness = product.primaryCategory === 'Chains' ? classifyChainThickness(product) : undefined;

  return {
    ...product,
    sellingPrice: price,
    originalPrice,
    discountPercent,
    chainThickness: thickness,
    pricingSource: `Approved Matrix Rule: ${rule.label}`,
  };
}

export interface PriceOverrideLog {
  productId: string;
  productName: string;
  category: CategoryType;
  oldPrice: number;
  newPrice: number;
  timestamp: string;
  authorizedBy: string;
  reason: string;
}

const STORAGE_KEY_OVERRIDE_LOGS = 'sjj_price_override_logs';

export function getPriceOverrideLogs(): PriceOverrideLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OVERRIDE_LOGS);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export function logPriceOverride(entry: PriceOverrideLog): void {
  try {
    const logs = getPriceOverrideLogs();
    logs.unshift(entry);
    localStorage.setItem(STORAGE_KEY_OVERRIDE_LOGS, JSON.stringify(logs.slice(0, 50)));
  } catch {
    // ignore
  }
}
