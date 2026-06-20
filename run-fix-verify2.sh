#!/bin/bash
cd /root/.openclaw/workspace
node --max-old-space-size=4096 run-preproduction-v3.js --project=health-edu-ep01 --cp=0.6 --film-type=EDU --realism-enhance=true --session=fix-verify-0616
