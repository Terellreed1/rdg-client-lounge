// Legacy static product data - kept for type reference only
// All product data is now managed via the database (Lovable Cloud)

export interface Product {
  id: number;
  name: string;
  brand: string;
  price: string;
  qty: number;
  image: string | null;
  description: string;
  isNew?: boolean;
  onSale?: boolean;
  strain?: "Indica" | "Sativa" | "Hybrid";
}

// Products are now fetched from the database
export const allProducts: Product[] = [];

export const brandOptions = ["All"];
export const priceOptions = ["All", "$65", "$60", "$50"];
