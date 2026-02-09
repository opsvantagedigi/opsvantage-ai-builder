#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nftPath = path.join(__dirname, '..', '.next', 'server', 'middleware.js.nft.json');
const middlewareManifestPath = path.join(__dirname, '..', '.next', 'server', 'middleware-manifest.json');
const middlewareJsPath = path.join(__dirname, '..', '.next', 'server', 'middleware.js');

// Check if middleware.js.nft.json already exists
if (fs.existsSync(nftPath)) {
  console.log('✓ middleware.js.nft.json already exists');
} else {
  // Read middleware manifest to get the edge chunks
  try {
    const manifestContent = fs.readFileSync(middlewareManifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);

    // Extract filenames from the middleware manifest
    const edgeChunkFiles = [];
    if (manifest.middleware && manifest.middleware['/']) {
      const middlewareConfig = manifest.middleware['/'];
      if (middlewareConfig.files) {
        // Remove 'server/' prefix since .nft.json is in the server directory
        edgeChunkFiles.push(...middlewareConfig.files.map(file =>
          file.startsWith('server/') ? file.substring('server/'.length) : file
        ));
      }
    }

    // Create the .nft.json file
    const nftContent = {
      version: 3,
      files: edgeChunkFiles.length > 0 ? edgeChunkFiles : []
    };

    fs.writeFileSync(nftPath, JSON.stringify(nftContent, null, 2));
    console.log('✓ Generated middleware.js.nft.json');
  } catch (error) {
    console.error('Error generating nft file:', error.message);
  }
}

// Create a stub middleware.js file for Vercel to find
// Vercel's build system needs to stat this file to understand edge functions
try {
  if (!fs.existsSync(middlewareJsPath)) {
    // Create a middleware handler that Vercel's launcher can invoke
    // The actual middleware logic is compiled to edge chunks via Turbopack
    const stub = `// Next.js 16 Turbopack compiled middleware
// The actual middleware logic is compiled to edge chunks via Turbopack
// This file is a placeholder for Vercel's build system

// Import NextResponse for proper response handling
const { NextResponse } = require('next/server');

// Export a handler function that Vercel can invoke
// This allows the middleware to be recognized and executed
async function middlewareHandler(req, context) {
  // The actual middleware execution happens through Vercel's edge runtime
  // and the compiled edge chunks referenced in middleware.js.nft.json
  // Return NextResponse.next() to allow request to proceed
  return NextResponse.next();
}

module.exports = middlewareHandler;\n`;
    fs.writeFileSync(middlewareJsPath, stub);
    console.log('✓ Generated middleware.js stub with handler for Vercel');
  }
} catch (error) {
  console.error('Error creating middleware.js stub:', error.message);
  // Don't fail the build if this fails
  process.exit(0);
}

