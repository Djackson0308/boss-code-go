#!/bin/bash
set -euo pipefail
set +x
[[ "$(git -C app-source rev-parse HEAD)" == c8b6dd6902acb0704efe8fb68fa883b707f01c22 ]] || exit 1
mkdir -p simulator-results
GO_REUSE_DIR="$RUNNER_TEMP/go-reused-simulator"
gh run download 40618963109 --repo Djackson0308/boss-code-go --name go-build-1-simulator-acceptance-40618963109 --dir "$GO_REUSE_DIR"
printf '%s  %s\n' f2969df8e76271edcd120db9739e31d777e02a96c14b3785b1183156406d8911 "$GO_REUSE_DIR/App-simulator.zip" | shasum -a 256 -c -
mkdir -p "$RUNNER_TEMP/go-build1-simulator/Build/Products/Debug-iphonesimulator"
ditto -x -k "$GO_REUSE_DIR/App-simulator.zip" "$RUNNER_TEMP/go-build1-simulator/Build/Products/Debug-iphonesimulator"
cp "$GO_REUSE_DIR/source-verification.json" simulator-results/source-verification.json
node --input-type=module <<'JS'
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const file='simulator-results/source-verification.json',record=JSON.parse(fs.readFileSync(file));
if(record.sourceCommit!=='c8b6dd6902acb0704efe8fb68fa883b707f01c22'||record.sourceFilesModified||record.testFixtureContent)throw Error('Unexpected reused source');
const product=path.join(process.env.RUNNER_TEMP,'go-build1-simulator/Build/Products/Debug-iphonesimulator/App.app');
const digest=crypto.createHash('sha256').update(fs.readFileSync(path.join(product,'public/index.html'))).digest('hex');
if(digest!==record.stagedIndexSha256)throw Error('Reused app content does not match original evidence');
record.reusedFromRun=40618963109;record.rebuilt=false;record.simulatorArchiveSha256='f2969df8e76271edcd120db9739e31d777e02a96c14b3785b1183156406d8911';
fs.writeFileSync(file,JSON.stringify(record,null,2)+'\n');console.log('Verified and reused exact-source simulator binary; no rebuild.');
JS
