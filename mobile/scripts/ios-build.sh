#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p artifacts/ios
xcodebuild -version | tee artifacts/ios/xcode-version.txt
SDK_VERSION="$(xcrun --sdk iphoneos --show-sdk-version)"
[[ "${SDK_VERSION%%.*}" -ge 26 ]] || { echo 'iOS SDK 26 or newer required'; exit 1; }
npm run build
npx cap sync ios
node --input-type=module -e "import fs from 'node:fs'; const m=JSON.parse(fs.readFileSync('build-manifest.json')); if(m.isolatedTestFixtures) throw Error('Fixture build cannot be archived');"
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release -destination 'generic/platform=iOS' -archivePath "$PWD/artifacts/ios/BOSS-CODE-GO-UNSIGNED.xcarchive" -derivedDataPath "$PWD/.ios-derived" CODE_SIGNING_ALLOWED=NO archive > artifacts/ios/archive.log 2>&1 || { tail -100 artifacts/ios/archive.log; exit 1; }
grep '\*\* ARCHIVE SUCCEEDED \*\*' artifacts/ios/archive.log
echo 'Unsigned iPhoneOS archive compiled. This is NOT an IPA or TestFlight upload.' | tee artifacts/ios/BUILD-STATUS.txt
cp build-manifest.json artifacts/ios/
