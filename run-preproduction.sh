#!/bin/bash
cd /root/.openclaw/workspace
rm -f output/health-edu-ep01/.checkpoint.json
exec node --max-old-space-size=4096 run-preproduction-v3.js "$@"
