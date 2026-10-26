#!/bin/bash
set -euo pipefail
cd "${CI_PRIMARY_REPOSITORY_PATH:?Xcode Cloud repository path is required}/mobile"
if ! command -v node >/dev/null || ! node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 22 ? 0 : 1)'; then
  command -v brew >/dev/null || { echo 'Node 22+ or Homebrew is required on this Xcode Cloud environment.'; exit 1; }
  HOMEBREW_NO_AUTO_UPDATE=1 brew install node@22
  export PATH="$(brew --prefix node@22)/bin:$PATH"
fi
node --input-type=module <<'JS'
import fs from 'node:fs';
const cfg=JSON.parse(fs.readFileSync('ios-release.json'));
if(Number(process.versions.node.split('.')[0])<22)throw Error('Node 22+ required');
if(!cfg.identifierOwnershipConfirmed || !cfg.signingReady || !/^[A-Z0-9]{10}$/.test(cfg.developerTeamId || ''))throw Error('Apple team and bundle ID must be verified before cloud signing');
if(JSON.parse(fs.readFileSync('capacitor.config.json')).appId !== cfg.provisionalBundleId)throw Error('Verified iOS bundle ID must match native configuration');
if(!cfg.internalTestFlightUploadAuthorized || cfg.externalTestingAuthorized || cfg.publicReviewAuthorized)throw Error('Only internal TestFlight is authorized');
const file='ios/App/App.xcodeproj/project.pbxproj';
let project=fs.readFileSync(file,'utf8');
project=project.replaceAll('CODE_SIGN_STYLE = Automatic;',`CODE_SIGN_STYLE = Automatic;\n\t\t\t\tDEVELOPMENT_TEAM = ${cfg.developerTeamId};`);
if(process.env.CI_BUILD_NUMBER){if(!/^\d+$/.test(process.env.CI_BUILD_NUMBER))throw Error('Invalid cloud build number');project=project.replace(/CURRENT_PROJECT_VERSION = \d+;/g,`CURRENT_PROJECT_VERSION = ${process.env.CI_BUILD_NUMBER};`);}
fs.writeFileSync(file,project);
JS
npm ci --no-audit --no-fund
npm run build
npx cap sync ios
