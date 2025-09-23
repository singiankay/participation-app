#!/usr/bin/env node

/**
 * Script to generate API keys for the participation app
 * Usage: node scripts/generate-api-keys.js [count]
 */

import crypto from 'crypto';

function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

function generateMultipleApiKeys(count = 3) {
  return Array.from({ length: count }, () => generateApiKey());
}

const count = parseInt(process.argv[2]) || 3;
const apiKeys = generateMultipleApiKeys(count);

console.log('Generated API Keys:');
console.log('===================');
apiKeys.forEach((key, index) => {
  console.log(`${index + 1}. ${key}`);
});

console.log('\nEnvironment Variable:');
console.log('=======================');
console.log(`API_KEYS=${apiKeys.join(',')}`);

console.log('\nUsage Instructions:');
console.log('=====================');
console.log('1. Copy the API_KEYS value above');
console.log('2. Add it to your GitHub Secrets (Settings > Secrets and variables > Actions)');
console.log('3. Add it to your Vercel Environment Variables');
console.log('4. For local development, add it to your .env.local file');

console.log('\nSecurity Notes:');
console.log('==================');
console.log('- Store these keys securely');
console.log('- Never commit them to version control');
console.log('- Rotate keys regularly');
console.log('- Use different keys for different environments');
