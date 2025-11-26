export type ReportStatus = 'lost' | 'found' | 'closed';
export type ReportType = 'lost' | 'found' | 'sighted';
export type PetSex = 'male' | 'female' | 'unknown';

export interface OwnerInfo {
  id: number;
  fullName: string;
  phone: string;
  email?: string | null;
  lineId?: string | null;
}

export interface PetInfo {
  id: number;
  ownerId: number;
  name: string;
  species: string;
  breed?: string | null;
  color?: string | null;
  sex: PetSex;
  ageYears?: number | null;
  microchipId?: string | null;
  specialMark?: string | null;
  mainPhotoUrl?: string | null;
}

export interface PetPhoto {
  id: number;
  petId: number;
  photoUrl: string;
  isMain: boolean;
  createdAt: string;
}

export interface PetReport {
  id: number;
  userId: number;
  petId: number;
  dateLost: string;
  province?: string | null;
  district?: string | null;
  lastSeenAddress?: string | null;
  lastSeenLat?: number | null;
  lastSeenLng?: number | null;
  rewardAmount: number;
  status: ReportStatus;
  reportType: ReportType;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  pet: PetInfo;
  owner: OwnerInfo;
  photos: PetPhoto[];
}

export interface ReportFilters {
  district?: string;
  province?: string;
  species?: string;
  status?: ReportStatus;
  reportType?: ReportType;
  search?: string;
  userId?: number;
}
