#!/bin/bash
set -euo pipefail
set +x
umask 077
cd "$(dirname "$0")/.."
[[ "$(uname -s)" == Darwin ]] || { echo 'This script requires the selected hosted macOS runner.'; exit 1; }
[[ "${GITHUB_REF:-}" == refs/heads/ios/testflight-deploy ]] || { echo 'Unexpected deployment branch.'; exit 1; }
[[ "${BOSS_GO_TEST_FIXTURES:-0}" != 1 ]] || { echo 'Fixture builds cannot be uploaded.'; exit 1; }
node scripts/ios-testflight-api.mjs preflight
xcodebuild -version
SDK_VERSION="$(xcrun --sdk iphoneos --show-sdk-version)"
[[ "${SDK_VERSION%%.*}" -ge 26 ]] || { echo 'iOS SDK 26 or newer required.'; exit 1; }
npm run build
npx cap sync ios
node --input-type=module <<'JS'
import fs from 'node:fs';
const request=JSON.parse(fs.readFileSync('ci/testflight-request.json'));
const manifest=JSON.parse(fs.readFileSync('build-manifest.json'));
if(manifest.isolatedTestFixtures || manifest.appId !== 'com.bosscodemedia.go')throw Error('Invalid distribution bundle');
const file='ios/App/App.xcodeproj/project.pbxproj';
const original=fs.readFileSync(file,'utf8');
const ids=[...original.matchAll(/PRODUCT_BUNDLE_IDENTIFIER = ([^;]+);/g)].map(m=>m[1]);
if(!ids.length || ids.some(id=>id!=='com.bosscodemedia.go'))throw Error('Unexpected native bundle identifier');
let project=original.replace(/CURRENT_PROJECT_VERSION = \d+;/g,`CURRENT_PROJECT_VERSION = ${request.buildNumber};`);
project=project.replace(/MARKETING_VERSION = [^;]+;/g,`MARKETING_VERSION = ${request.version};`);
fs.writeFileSync(file,project);
JS

signing_temp="$(mktemp -d "${RUNNER_TEMP:?}/go-signing.XXXXXX")"
keychain_path="$signing_temp/go-signing.keychain-db"
cleanup() {
  security delete-keychain "$keychain_path" >/dev/null 2>&1 || true
  rm -rf "$signing_temp"
}
trap cleanup EXIT
keychain initialize --path "$keychain_path"
# The persistent private key is supplied as a protected environment secret.
# CLI reuses its matching certificate/profile; it creates only missing assets.
app-store-connect fetch-signing-files com.bosscodemedia.go \
  --platform IOS --type IOS_APP_STORE --strict-match-identifier --create \
  --certificates-dir "$signing_temp/certificates" --profiles-dir "$signing_temp/profiles"
keychain add-certificates --path "$keychain_path" --certificate "$signing_temp/certificates/*.p12"
xcode-project use-profiles --project ios/App/App.xcodeproj \
  --profile "$signing_temp/profiles/*.mobileprovision" --archive-method app-store \
  --export-options-plist "$signing_temp/export-options.plist" \
  --custom-export-options '{"method":"app-store","teamID":"TW7B5QZNV4","manageAppVersionAndBuildNumber":false}'
xcode-project build-ipa --project ios/App/App.xcodeproj --scheme App --config Release \
  --no-show-build-settings --disable-xcpretty \
  --archive-directory "$signing_temp/archive" --ipa-directory "$signing_temp/ipa" \
  --export-options-plist "$signing_temp/export-options.plist"
ipa_paths=("$signing_temp"/ipa/*.ipa)
[[ ${#ipa_paths[@]} -eq 1 && -f "${ipa_paths[0]}" ]] || { echo 'Expected exactly one signed IPA.'; exit 1; }
# Omitting --testflight prevents external beta review; --app-store is also omitted.
app-store-connect publish --path "${ipa_paths[0]}"
node scripts/ios-testflight-api.mjs monitor
