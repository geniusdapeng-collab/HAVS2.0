#!/usr/bin/env node
// wrapper to run preproduction with proper flags
const { execSync } = require('child_process');
process.env.NODE_OPTIONS = '--max-old-space-size=4096 --expose-gc';
require('./run-preproduction-v3.js');
