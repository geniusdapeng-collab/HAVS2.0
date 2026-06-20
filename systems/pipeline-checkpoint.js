'use strict';

const fs = require('fs');
const path = require('path');

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function saveCheckpoint(filePath, data) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function loadCheckpoint(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function updateShotPromptIncrementally(filePath, shotId, prompt, extra = {}) {
  const data = loadCheckpoint(filePath, { shots: [] });

  const idx = data.shots.findIndex((s) => s.id === shotId);
  if (idx >= 0) {
    data.shots[idx] = { ...data.shots[idx], prompt, ...extra };
  } else {
    data.shots.push({ id: shotId, prompt, ...extra });
  }

  saveCheckpoint(filePath, data);
}

function appendJsonl(filePath, item) {
  ensureDir(filePath);
  fs.appendFileSync(filePath, JSON.stringify(item) + '\n', 'utf8');
}

module.exports = {
  saveCheckpoint,
  loadCheckpoint,
  updateShotPromptIncrementally,
  appendJsonl,
};
