#!/bin/bash
cd /root/.openclaw/workspace
node --expose-gc run-preproduction-v3.js --project=health-edu-ep01 --cp=0.82 --film-type=EDU --realism-enhance=true --session=health-edu-ep01-v6.6.8-test 2>&1
