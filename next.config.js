/** @type {import('next').NextConfig} */

const fs = require('fs');
const dotenv = require('dotenv');

let env = {};

// Check if .env exists
if (fs.existsSync('.env')) {
  env = dotenv.parse(fs.readFileSync('.env'));
} else {
  env = process.env;
}

const nextConfig = {
  reactStrictMode: true,
  env: env
};

module.exports = nextConfig;
