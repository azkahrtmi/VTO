/** 
 * VTO Glasses Type Definition 
 * Menggunakan class agar modul tidak kosong saat dikompilasi ke JS
 */
export class Glasses {
  id: string = '';
  sku: string = '';
  name: string = '';
  color: string = '';
  type: 'jeeliz' | 'local' = 'local';
  scale?: string;
  position?: string;
  rotation?: string;
}

export const VTO_CHECK = true;
