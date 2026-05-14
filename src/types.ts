
export type TransportMode = 'Motosikal' | 'Kereta' | 'Bas' | 'Basikal' | 'Jalan Kaki' | 'Dihantar Penjaga' | 'Lain-lain' | 'Tiada' | 'BERHENTI/PINDAH';
export type LicenseType = 'Motosikal (B2/B)' | 'Kereta (D/DA)' | 'Tiada';

export interface Student {
  id: string;
  name: string;
  form: string;
  className: string;
  transportMode: TransportMode;
  hasLicense: boolean;
  licenseType: LicenseType;
}

export interface TransportStats {
  totalStudents: number;
  totalLicensed: number;
  motorcycleLicensed: number;
  carLicensed: number;
  recordedCount: number;
  completedClasses: string[];
  // Mode counts
  motosikalCount: number;
  keretaCount: number;
  basikalCount: number;
  jalanKakiCount: number;
  dihantarPenjagaCount: number;
  basCount: number;
  lainLainCount: number;
  // Licensing details
  motosikalWithLicense: number;
  motosikalNoLicense: number;
  keretaWithLicense: number;
  keretaNoLicense: number;
}
