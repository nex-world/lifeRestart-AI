
import Dexie from 'dexie';

const db = new Dexie('AgentCompanyDemoRecords');
db.version(1).stores({
  kvs: '++id, &key, value',
  functions: '++id, &name, config',
  records: '++id, supplier, function, input, output',
  chats: '++id, title',
});

export default db;
