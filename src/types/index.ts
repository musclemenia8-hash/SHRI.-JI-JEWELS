export type CategoryType = 
  | 'Chains' 
  | 'Rings' 
  | 'Kada' 
  | 'Pendants' 
  | 'Earrings' 
  | 'Ladies Sets' 
  | 'Mangalsutra' 
  | 'Bracelets';

export type AudienceType = 'Men' | 'Women' | 'Unisex';

export interface Product {
  id: string;
  name: string;
  slug: string;
  primaryCategory: CategoryType;
  secondaryCategory?: string;
  audience: AudienceType;
  productType: string;
  chainThickness?: 'Thin' | 'Thick';
  image: string;
  additionalImages?: string[];
  sellingPrice: number;
  originalPrice?: number;
  discountPercent?: number;
  description: string;
  availability: 'In Stock' | 'Made to Order' | 'Sold Out';
  isNewArrival: boolean;
  isBestseller: boolean;
  pricingSource: string;
  identificationConfidence: 'High' | 'Verified';
  approvalStatus: 'Approved' | 'Pending Review';
  features: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerReview {
  id: string;
  customerName: string;
  city: string;
  rating: number;
  comment: string;
  productPurchased: string;
  date: string;
  isApproved: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Orders & Booking' | 'Advance Payment' | 'Policies' | 'Support';
}

export interface CheckoutFormData {
  fullName: string;
  mobileNumber: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  notes?: string;
}
