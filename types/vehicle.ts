export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color?: string;
  imageUrl?: string;
  type?: 'car' | 'bike';
  nickname?: string;
} 