export interface Receipt {
  id: string;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string;
  image: string | null; // Base64
  syncStatus?: 'pending' | 'synced' | 'failed';
}
