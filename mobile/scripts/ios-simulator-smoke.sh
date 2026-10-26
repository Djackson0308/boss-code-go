#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Review guard is added ONLY after the clean iPhoneOS archive, to simulator resources.
node --input-type=module <<'JS'
import fs from 'node:fs';
const file='ios/App/App/public/index.html';
let html=fs.readFileSync(file,'utf8');
const guard=`<script id="ios-simulator-read-only-review">
(() => {
 const safe = method => ['GET','HEAD','OPTIONS'].includes(String(method || 'GET').toUpperCase());
 const originalFetch = window.fetch.bind(window);
 window.fetch = (input, options = {}) => safe(options.method || input?.method) ? originalFetch(input, options) : Promise.reject(new Error('Simulator review blocks writes'));
 navigator.sendBeacon = () => false;
 const open = XMLHttpRequest.prototype.open;
 XMLHttpRequest.prototype.open = function(method, ...args) { if(!safe(method)) throw new Error('Simulator review blocks writes'); return open.call(this, method, ...args); };
 window.addEventListener('DOMContentLoaded', () => {
   const label=document.createElement('div'); label.textContent='READ-ONLY iOS SIMULATOR REVIEW';
   label.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:2147483647;background:#fff;color:#000;font:11px sans-serif;text-align:center'; document.body.append(label);
 });
})();
</script>`;
html=html.replace('<script src="native.js"></script>','<script src="native.js"></script>'+guard);
fs.writeFileSync(file,html);
JS
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug -destination 'generic/platform=iOS Simulator' -derivedDataPath "$PWD/.ios-simulator" CODE_SIGNING_ALLOWED=NO build > artifacts/ios/simulator-build.log 2>&1 || { tail -80 artifacts/ios/simulator-build.log; exit 1; }
SIM_ID="$(xcrun simctl list devices available -j | node --input-type=module -e 'let s=""; for await(const c of process.stdin)s+=c;const all=JSON.parse(s).devices;const k=Object.keys(all).filter(k=>/iOS-(26|27)/.test(k)).sort().reverse()[0];const d=all[k]?.find(d=>d.name.startsWith("iPhone"));if(!d)throw Error("No current iPhone simulator");console.log(d.udid);')"
xcrun simctl boot "$SIM_ID"
xcrun simctl bootstatus "$SIM_ID" -b
xcrun simctl install "$SIM_ID" .ios-simulator/Build/Products/Debug-iphonesimulator/App.app
xcrun simctl launch "$SIM_ID" com.bosscodemedia.go | tee artifacts/ios/simulator-launch.txt
sleep 20
xcrun simctl io "$SIM_ID" screenshot artifacts/ios/READ-ONLY-SIMULATOR-STARTUP.png
xcrun simctl shutdown "$SIM_ID"
echo 'Simulator launched; screenshot requires visual inspection. No physical iPhone acceptance is claimed.' > artifacts/ios/simulator-scope.txt
