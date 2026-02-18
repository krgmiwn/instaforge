
import { InstagramAccount } from '../types';

const STORAGE_KEY = 'instaforge_accounts';

export const saveAccount = (account: InstagramAccount) => {
  const accounts = getAccounts();
  accounts.unshift(account);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
};

export const getAccounts = (): InstagramAccount[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteAccount = (id: string) => {
  const accounts = getAccounts().filter(acc => acc.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
};
