#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nftPath = path.join(__dirname, '..', '.next', 'server', 'middleware.js.nft.json');
const middlewareManifestPath = path.join(__dirname, '..', '.next', 'server', 'middleware-manifest.json');

// Check if middleware.js.nft.json already exists
if (fs.existsSync(nftPath)) {
  console.log('✓ middleware.js.nft.json already exists');
  process.exit(0);
}

// Read middleware manifest to get the edge chunks
try {
  const manifestContent = fs.readFileSync(middlewareManifestPath, 'utf8');
  const manifest = JSON.parse(manifestContent);

  // Extract filenames from the middleware manifest
  const edgeChunkFiles = [];
  if (manifest.middleware && manifest.middleware['/']) {
    const middlewareConfig = manifest.middleware['/'];
    if (middlewareConfig.files) {
      edgeChunkFiles.push(...middlewareConfig.files);
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
  // Don't fail the build if this script fails
  process.exit(0);
}

