import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const mobile = fileURLToPath(new URL('../', import.meta.url));
const read = async name => JSON.parse(await fs.readFile(mobile + name, 'utf8'));
const cfg = await read('ios-release.json');
const request = await read('ci/testflight-request.json');
assert.equal(cfg.developerTeamId, 'TW7B5QZNV4');
assert.equal(cfg.appStoreConnectAppId, '6827774049');
assert.equal(cfg.provisionalBundleId, 'com.bosscodemedia.go');
assert(cfg.identifierOwnershipConfirmed && cfg.internalTestFlightUploadAuthorized && cfg.internalTestingTeamApproved);
assert(!cfg.externalTestingAuthorized && !cfg.publicReviewAuthorized);
assert.equal(request.appId, cfg.appStoreConnectAppId);
assert.equal(request.bundleId, cfg.provisionalBundleId);
assert.equal(request.version, cfg.version);
assert(/^\d+$/.test(String(request.buildNumber)) && Number(request.buildNumber) > 0);

async function api(path) {
  const enc = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const now = Math.floor(Date.now()/1000);
  const unsigned = enc({ alg:'ES256', kid:process.env.APP_STORE_CONNECT_KEY_IDENTIFIER, typ:'JWT' }) + '.' +
    enc({ iss:process.env.APP_STORE_CONNECT_ISSUER_ID, iat:now, exp:now+600, aud:'appstoreconnect-v1' });
  const token = unsigned + '.' + crypto.sign('sha256', Buffer.from(unsigned), {
    key:process.env.APP_STORE_CONNECT_PRIVATE_KEY, dsaEncoding:'ieee-p1363',
  }).toString('base64url');
  const response = await fetch('https://api.appstoreconnect.apple.com' + path, {
    headers:{ Authorization:'Bearer ' + token }, signal:AbortSignal.timeout(60000),
  });
  const body = await response.json();
  if (!response.ok) throw Error(`Apple API ${response.status}: ${body.errors?.map(e=>e.code).join(', ')}`);
  return body;
}

if (process.argv[2] === 'preflight') {
  for (const name of ['APP_STORE_CONNECT_PRIVATE_KEY','APP_STORE_CONNECT_KEY_IDENTIFIER','APP_STORE_CONNECT_ISSUER_ID','CERTIFICATE_PRIVATE_KEY']) {
    assert(process.env[name], `Required protected environment secret missing: ${name}`);
  }
  const app = (await api('/v1/apps/' + cfg.appStoreConnectAppId)).data;
  assert.equal(app.attributes.bundleId, cfg.provisionalBundleId);
  const identifiers = (await api('/v1/bundleIds?filter[identifier]=' + cfg.provisionalBundleId)).data;
  assert.equal(identifiers.length, 1, 'Existing exact Apple identifier required; do not create another');
  assert.equal(identifiers[0].attributes.seedId, cfg.developerTeamId);
  assert.equal(identifiers[0].attributes.identifier, cfg.provisionalBundleId);
  const existing = (await api(`/v1/builds?filter[app]=${request.appId}&filter[version]=${request.buildNumber}&limit=200&include=preReleaseVersion`));
  const versions = new Map((existing.included || []).map(v=>[v.id,v.attributes.version]));
  assert(!existing.data.some(b=>versions.get(b.relationships?.preReleaseVersion?.data?.id) === request.version), 'This version/build already exists at Apple; do not upload it again');
  console.log(`Verified Apple app ${request.appId}, exact bundle ID, team, and unused build ${request.version} (${request.buildNumber}).`);
} else if (process.argv[2] === 'monitor') {
  const deadline = Date.now() + 40*60*1000;
  await fs.mkdir(mobile + 'artifacts/ios-testflight', { recursive:true });
  while (Date.now() < deadline) {
    const result = await api(`/v1/builds?filter[app]=${request.appId}&filter[version]=${request.buildNumber}&limit=200&include=preReleaseVersion,buildBetaDetail`);
    const versions = new Map((result.included || []).filter(v=>v.type==='preReleaseVersions').map(v=>[v.id,v.attributes.version]));
    const build = result.data.find(b=>versions.get(b.relationships?.preReleaseVersion?.data?.id) === request.version);
    const beta = result.included?.find(v=>v.type==='buildBetaDetails' && v.id===build?.relationships?.buildBetaDetail?.data?.id);
    const evidence = { checkedAt:new Date().toISOString(), appId:request.appId, version:request.version,
      buildNumber:String(request.buildNumber), buildId:build?.id || null,
      processingState:build?.attributes.processingState || 'NOT_YET_VISIBLE',
      usesNonExemptEncryption:build?.attributes.usesNonExemptEncryption ?? null,
      internalBuildState:beta?.attributes.internalBuildState || null,
      uploadedDate:build?.attributes.uploadedDate || null };
    await fs.writeFile(mobile + 'artifacts/ios-testflight/processing.json', JSON.stringify(evidence,null,2)+'\n');
    console.log(JSON.stringify(evidence));
    if (['FAILED','INVALID'].includes(evidence.processingState)) throw Error('Apple rejected processing; inspect the build delivery details');
    if (evidence.processingState === 'VALID') break;
    await new Promise(resolve=>setTimeout(resolve,30000));
  }
  const evidence = await read('artifacts/ios-testflight/processing.json');
  if (evidence.processingState !== 'VALID') throw Error('Apple processing is still pending; resume monitoring without rebuilding or reuploading');
} else {
  throw Error('Expected preflight or monitor');
}
