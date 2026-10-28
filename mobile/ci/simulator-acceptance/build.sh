#!/bin/bash
set -euo pipefail
set +x
mkdir -p simulator-results
cd app-source
[[ "$(git rev-parse HEAD)" == c8b6dd6902acb0704efe8fb68fa883b707f01c22 ]] || { echo 'Wrong application revision.'; exit 1; }
cd mobile
npm ci --no-audit --no-fund
npm run build
npx cap sync ios
node --input-type=module <<'JS'
import fs from 'node:fs';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
const manifest=JSON.parse(fs.readFileSync('build-manifest.json'));
if(manifest.isolatedTestFixtures || manifest.appId!=='com.bosscodemedia.go')throw Error('Invalid source for genuine screenshots');
const tracked=execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
// cap sync regenerates its SPM package file; it must remain the same as the tested project.
if(tracked.length)throw Error('Tracked application files changed during staging: '+tracked.join(', '));
const html=fs.readFileSync('ios/App/App/public/index.html','utf8');
if(html.includes('ios-simulator-read-only-review')||html.includes('isolated-test-fixtures'))throw Error('Modified test-only app cannot supply store screenshots');
const record={sourceCommit:'c8b6dd6902acb0704efe8fb68fa883b707f01c22',version:'1.0.0',buildNumber:1,simulatorConfiguration:'Debug, CODE_SIGNING_ALLOWED=NO',sourceFilesModified:false,testFixtureContent:false,applicationInstrumentationInjected:false,manifest,stagedIndexSha256:crypto.createHash('sha256').update(html).digest('hex')};
fs.writeFileSync('../../simulator-results/source-verification.json',JSON.stringify(record,null,2)+'\n');
JS
xcodebuild -version
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug \
  -destination 'generic/platform=iOS Simulator' -derivedDataPath "$RUNNER_TEMP/go-build1-simulator" \
  CODE_SIGNING_ALLOWED=NO build > "$RUNNER_TEMP/go-simulator-build.log" 2>&1 || { tail -60 "$RUNNER_TEMP/go-simulator-build.log"; exit 1; }
grep '\*\* BUILD SUCCEEDED \*\*' "$RUNNER_TEMP/go-simulator-build.log"
