#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 读取 run-havs-preproduction.js 的内容并执行
const scriptPath = path.join(__dirname, 'run-havs-preproduction.js');
require(scriptPath);
