#!/usr/bin/env node

/**
 * Manual seed runner script
 * 
 * This script can be used to manually run the seed process
 * in both development and production environments.
 * 
 * Usage: 
 *   - Development: node scripts/run-seed.js
 *   - Production: NODE_ENV=production node scripts/run-seed.js
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Determine if running in production
const isProduction = process.env.NODE_ENV === 'production';

console.log(`Running seed in ${isProduction ? 'production' : 'development'} mode...`);

// Command to run based on environment
const seedCommand = isProduction 
  ? 'npx prisma db seed'
  : 'ts-node prisma/seed.ts';

// Execute the command
exec(seedCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`Execution error: ${error.message}`);
    process.exit(1);
  }
  
  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }
  
  console.log(stdout);
  console.log('Seed completed successfully!');
}); 