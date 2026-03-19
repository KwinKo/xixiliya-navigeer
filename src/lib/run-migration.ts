import { neon } from '@neondatabase/serverless';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_jaAB5mMb4tfd@ep-little-leaf-ah9dyvqb-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);

async function runMigration() {
  try {
    console.log('Starting database migration...');
    
    // 检查并添加 clickCount 列
    console.log('Checking for clickCount column...');
    const clickCountExists = await sql(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'bookmarks' 
      AND column_name = 'clickCount'
    `);
    
    if (clickCountExists.length === 0) {
      console.log('Adding clickCount column...');
      await sql(`ALTER TABLE bookmarks ADD COLUMN clickCount INTEGER DEFAULT 0`);
      console.log('✓ Added clickCount column to bookmarks table');
    } else {
      console.log('✓ clickCount column already exists in bookmarks table');
    }
    
    // 检查并添加 lastAccessed 列
    console.log('Checking for lastAccessed column...');
    const lastAccessedExists = await sql(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'bookmarks' 
      AND column_name = 'lastAccessed'
    `);
    
    if (lastAccessedExists.length === 0) {
      console.log('Adding lastAccessed column...');
      await sql(`ALTER TABLE bookmarks ADD COLUMN lastAccessed TIMESTAMP WITH TIME ZONE`);
      console.log('✓ Added lastAccessed column to bookmarks table');
    } else {
      console.log('✓ lastAccessed column already exists in bookmarks table');
    }
    
    // 验证列是否已添加
    console.log('Verifying columns...');
    const columns = await sql(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'bookmarks' 
      AND column_name IN ('clickCount', 'lastAccessed')
      ORDER BY column_name
    `);
    
    console.log('Migration completed successfully!');
    console.log('Columns:', columns);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();