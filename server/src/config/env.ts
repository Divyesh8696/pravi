import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root or server folder
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/municipal_swm?replicaSet=rs0'),
  JWT_SECRET: z.string().default('super_secret_jwt_key_municipal_swm_2026_secure'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  STORAGE_DIR: z.string().default('./storage'),
  CITY_CODE: z.string().default('DEMO-CITY'),
  CITY_NAME: z.string().default('Gandhinagar Municipal Operations Demo'),
  CITY_CENTER_LAT: z.coerce.number().default(23.2156),
  CITY_CENTER_LNG: z.coerce.number().default(72.6369),
  CITY_DEFAULT_ZOOM: z.coerce.number().default(12),
  CLIENT_URL: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
