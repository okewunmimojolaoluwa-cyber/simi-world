#!/bin/bash
# Custom build script to use npm install instead of npm ci
npm install --legacy-peer-deps
npm run build
