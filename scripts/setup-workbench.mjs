import 'dotenv/config';
import mysql from 'mysql2/promise';
import {readFile} from 'node:fs/promises';
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL is required');
const conn=await mysql.createConnection(process.env.DATABASE_URL);
try{const sql=await readFile(new URL('../server/workbench/schema.sql',import.meta.url),'utf8');for(const stmt of sql.split(';').filter(s=>s.trim()))await conn.query(stmt);console.log('Workbench schema ready. Existing records preserved.')}finally{await conn.end()}
