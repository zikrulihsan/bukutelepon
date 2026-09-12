export interface Profile {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: "USER" | "ADMIN";
  plan: "FREE" | "PRO";
  hasContributed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BusinessStatus = "DRAFT" | "ACTIVE" | "HIDDEN";
export type CatalogLinkStatus = "PENDING" | "APPROVED" | "REJECTED";
export type StorefrontItemStatus = "ACTIVE" | "HIDDEN" | "SOLD_OUT";
export type StorefrontPriceType = "FIXED" | "STARTING_FROM" | "CONTACT" | "FREE";
export type StorefrontItemType = "PRODUCT" | "SERVICE" | "PACKAGE" | "PROMO";

export interface ManagedStorefrontItem {
  id: string;
  businessId: string;
  type: StorefrontItemType;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  price: number;
  priceType: StorefrontPriceType;
  unit: string | null;
  imageUrl: string | null;
  badge: string | null;
  status: StorefrontItemStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ManagedBusiness {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  whatsapp: string;
  alternateWhatsapp: string | null;
  instagram: string | null;
  address: string | null;
  mapsUrl: string | null;
  openingHours: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  status: BusinessStatus;
  createdAt: string;
  updatedAt: string;
  items: ManagedStorefrontItem[];
  contact?: Contact | null;
  catalogLinkRequest?: CatalogLinkRequest | null;
}

export interface CatalogLinkRequest {
  id: string;
  businessId: string;
  contactId: string;
  status: CatalogLinkStatus;
  createdAt: string;
  updatedAt: string;
  contact: Contact;
  business?: ManagedBusiness & { owner?: Pick<Profile, "id" | "name" | "email" | "phone"> };
}

export interface City {
  id: string;
  name: string;
  slug: string;
  province: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { contacts: number };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { contacts: number };
}

export type ContactStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  website: string | null;
  mapsUrl: string | null;
  description: string | null;
  descriptionEn: string | null;
  imageUrl: string | null;
  status: ContactStatus;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  cityId: string;
  city?: City;
  categoryId: string;
  category?: Category;
  submittedById: string;
  submittedBy?: Profile;
  reviews?: Review[];
  business?: { name: string; slug: string; status: BusinessStatus } | null;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  contactId: string;
  contact?: Contact;
  authorId: string;
  author?: Pick<Profile, "id" | "name">;
}

export interface GuestSession {
  viewCount: number;
  threshold: number;
  remaining: number;
  isLocked: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Array<{ path: string; message: string }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
