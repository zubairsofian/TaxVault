import { Receipt } from '../types';

const STORAGE_KEY = 'taxvault_data';

export const saveReceipts = (receipts: Receipt[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
};

export const loadReceipts = (): Receipt[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load receipts", error);
    return [];
  }
};
