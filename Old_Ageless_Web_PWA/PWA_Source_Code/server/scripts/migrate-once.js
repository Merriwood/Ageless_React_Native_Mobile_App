import { query } from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main(){
  if(!process.env.DATABASE_URL){
    console.log('No DATABASE_URL set; skipping migrate');
    return;
  }
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../schema.sql'),'utf8');
    await query(sql);
    console.log('Migration complete');
  } catch(e){
    console.error('Migration failed:', e.message);
    process.exitCode = 0; // do not fail build
  }
}
main();