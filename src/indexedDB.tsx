import { openDB, deleteDB, IDBPDatabase } from 'idb';

const DB_NAME = 'my-database';
const DB_VERSION = 1;
const STORE_NAME = 'my-store';

interface MyDB {
  'my-store': {
    key: number;
    value: { id?: number; name: string };
  };
}

export const initDB = async (): Promise<IDBPDatabase<MyDB>> => {
  const db = await openDB<MyDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
  return db;
};

export const addData = async (data: { name: string }): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.add(data);
  await tx.done;
};

export const clearData = async (): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.clear();
  await tx.done;
};

export const deleteDatabase = async (): Promise<void> => {
  await deleteDB(DB_NAME);
};