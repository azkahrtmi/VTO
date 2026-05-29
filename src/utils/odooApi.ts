/**
 * Odoo VTO API Client
 * 
 * Hook dan utility untuk fetch data kacamata dari Odoo CMS API.
 * Odoo berjalan di localhost:8069 (dev) atau VPS (production).
 * 
 * Endpoints yang tersedia:
 *   GET /api/vto/health          → Health check
 *   GET /api/vto/glasses         → List semua kacamata
 *   GET /api/vto/glasses/:id     → Detail satu kacamata
 *   GET /api/vto/glasses/featured → Kacamata unggulan
 */

// Base URL Odoo — ganti sesuai environment
const ODOO_BASE_URL = import.meta.env.VITE_ODOO_URL || 'http://localhost:8069';

// ── Types ──────────────────────────────────────────────────────

export interface OdooGlassesProduct {
  id: number;
  name: string;
  sku: string;
  brand: string;
  description: string;
  price: number;
  price_discount: number;
  color: string;
  color_hex: string;
  image_url: string;
  model_3d_url: string;
  deepar_effect_url: string;
  engine: 'mindar' | 'deepar';
  category: 'optical' | 'sunglasses' | 'sports';
  is_featured: boolean;
}

interface OdooAPIResponse<T> {
  success: boolean;
  count?: number;
  data: T;
  error?: string;
}

// ── API Functions ──────────────────────────────────────────────

/**
 * Health check — verifikasi Odoo API bisa diakses
 */
export async function checkOdooHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${ODOO_BASE_URL}/api/vto/health`);
    const data = await res.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * Fetch semua kacamata yang published dari Odoo
 */
export async function fetchGlassesFromOdoo(): Promise<OdooGlassesProduct[]> {
  const res = await fetch(`${ODOO_BASE_URL}/api/vto/glasses`);
  
  if (!res.ok) {
    throw new Error(`Odoo API error: ${res.status} ${res.statusText}`);
  }
  
  const data: OdooAPIResponse<OdooGlassesProduct[]> = await res.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Unknown Odoo API error');
  }
  
  return data.data;
}

/**
 * Fetch detail satu kacamata by ID
 */
export async function fetchGlassesByIdFromOdoo(id: number): Promise<OdooGlassesProduct> {
  const res = await fetch(`${ODOO_BASE_URL}/api/vto/glasses/${id}`);
  
  if (!res.ok) {
    throw new Error(`Odoo API error: ${res.status} ${res.statusText}`);
  }
  
  const data: OdooAPIResponse<OdooGlassesProduct> = await res.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Product not found');
  }
  
  return data.data;
}

/**
 * Fetch kacamata unggulan saja
 */
export async function fetchFeaturedGlasses(): Promise<OdooGlassesProduct[]> {
  const res = await fetch(`${ODOO_BASE_URL}/api/vto/glasses/featured`);
  
  if (!res.ok) {
    throw new Error(`Odoo API error: ${res.status} ${res.statusText}`);
  }
  
  const data: OdooAPIResponse<OdooGlassesProduct[]> = await res.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Unknown Odoo API error');
  }
  
  return data.data;
}
