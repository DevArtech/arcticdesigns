/** @type {import('next').NextConfig} */

const fs = require('fs');
const dotenv = require('dotenv');

let env = {};

// Check if .env file exists
if (fs.existsSync('.env')) {
  // Load environment variables from .env file
  env = dotenv.parse(fs.readFileSync('.env'));
} else {
  // Copy process.env excluding variables that start with __, NODE_, or are NEXT_RUNTIME
  for (let key in process.env) {
    if (!key.startsWith('__') && !key.startsWith('NODE_') && key !== 'NEXT_RUNTIME') {
      env[key] = process.env[key];
    }
  }
}

const nextConfig = {
  reactStrictMode: false,
  env: env
};

module.exports = nextConfig;
