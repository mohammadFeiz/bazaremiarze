import { deleteDatabase } from './indexedDB';
import { APP_VERSION } from './config';

export const checkAndUpdateVersion = async (): Promise<void> => {
  const storedVersion = localStorage.getItem('appVersion');
  
  if (storedVersion !== APP_VERSION) {
    // اگر نسخه تغییر کرده باشد
    await deleteDatabase(); // دیتابیس IndexedDB را کاملاً پاک کن
    localStorage.setItem('appVersion', APP_VERSION); // نسخه جدید را ذخیره کن
  }
};