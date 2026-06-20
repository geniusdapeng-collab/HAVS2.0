#!/bin/bash
cd /root/.openclaw/workspace
node run-preproduction-v3.js --project=health-edu-ep01 --cp=0.6 --film-type=EDU --session=glow-reef > /tmp/preproduction-glow-reef.log 2>&1
echo "Exit code: $?" >> /tmp/preproduction-glow-reef.log
