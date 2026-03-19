import { neon } from '@neondatabase/serverless';

// 从环境变量中读取Neon连接字符串
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_jaAB5mMb4tfd@ep-little-leaf-ah9dyvqb-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);

export default sql;