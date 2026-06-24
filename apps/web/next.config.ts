import path from 'node:path';
import { config } from 'dotenv';
import type { NextConfig } from 'next';

// Load monorepo root .env so web shares the same Cognito config as the API.
config({ path: path.resolve(__dirname, '../../.env') });

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@memrider/shared'],
};

export default nextConfig;
