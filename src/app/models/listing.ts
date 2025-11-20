export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  city: string;
  state: string;
  ownerId: string;
  contactPhone?: string;
  contactEmail?: string;
  createdAt: number;
  views: number;
  isActive: boolean;
}
