export interface Profile {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  hasContributed: boolean;
  createdAt: string;
  updatedAt: string;
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
    guestLimited?: boolean;
    guestThreshold?: number;
  };
}
