/** @type {import('next').NextConfig} */

const fs = require('fs');
const dotenv = require('dotenv');

let env = {};

// Check if .env file exists
if (fs.existsSync('.env')) {
  // Load environment variables from .env file
  env = dotenv.parse(fs.readFileSync('.env'));
} else {
  // Copy process.env excluding NODE_ENV
  for (let key in process.env) {
    if (key !== 'NODE_ENV') {
      env[key] = process.env[key];
    }
  }
}

const nextConfig = {
  reactStrictMode: true,
  env: env
};

module.exports = nextConfig;
