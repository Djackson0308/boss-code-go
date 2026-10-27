# Hosted internal TestFlight deployment

Selected service: existing GitHub Actions standard `macos-26` runner in the public
`Djackson0308/boss-code-go` repository. Standard public-repository runner minutes
are free. No larger runner, subscription, or paid service is configured.

Codemagic supports Capacitor and automatic Apple signing, but would add an account
connection. Its personal plan includes 500 macOS M2 minutes per month; teams do
not receive that allowance. The selected workflow uses the open-source Codemagic
CLI tools 0.70.1 on GitHub's runner without a Codemagic account or API connection.

The source lives only on `ios/testflight-deploy`. Production `main`, shared
frontend source, backend, website deployment, and Android files are untouched.

## Credential approval and scope

Before any transfer, the owner must approve placing the existing App Store
Connect `.p8` key and a persistent distribution-certificate private key in the
GitHub Actions environment `testflight-internal`, limited to this iOS branch.
Apple key role: App Manager. This role has team-wide Apple API capabilities;
the workflow itself checks app `6827774049`, team `TW7B5QZNV4`, and exact bundle
ID `com.bosscodemedia.go`. GitHub environment secrets are encrypted storage, not
source files or commits. No credentials are sent to Codemagic's hosted service.

Required environment secrets:

- `APP_STORE_CONNECT_PRIVATE_KEY`
- `APP_STORE_CONNECT_KEY_IDENTIFIER`
- `APP_STORE_CONNECT_ISSUER_ID`
- `APPLE_DISTRIBUTION_PRIVATE_KEY`

The original API key and persistent certificate key remain backed up in the
owner's restricted local application-data directory outside the repository.
Persistent certificate-key reuse prevents generating a new certificate on every
run. The signing CLI fetches matching profiles/certificates and creates only
missing assets. It never deletes or revokes signing assets.

## Launch and recovery

After approval and credential configuration, commit only a deployment request
at `mobile/ci/testflight-request.json` on the iOS branch, for example:

```json
{"appId":"6827774049","bundleId":"com.bosscodemedia.go","version":"1.0.0","buildNumber":1}
```

That exact path triggers the signed deployment workflow. Preflight verifies the
existing Apple records and unused version/build number. It stages the reviewed
frontend, syncs the existing Capacitor iOS project, applies distribution profiles,
archives and exports a signed IPA, and uploads it to Apple. It then polls the
matching build for up to 40 minutes, recording Apple's actual processing state.
Only sanitized processing evidence is retained as a GitHub artifact. Signing
files, IPA, and keychain are confined to the ephemeral runner and removed at exit.

No external beta review or public submission is requested. A VALID processing
state is not a claim of internal installability: encryption compliance and an
internal tester group still must be inspected and completed using verified facts.

If upload succeeds but Apple processing exceeds the wait, resume monitoring via
the local Apple API without rebuilding or uploading the same version/build again.

Official references checked October 27, 2026:

- https://docs.github.com/en/actions/reference/runners/github-hosted-runners
- https://docs.codemagic.io/billing/pricing/
- https://docs.codemagic.io/yaml-code-signing/alternative-code-signing-methods/
- https://github.com/codemagic-ci-cd/cli-tools/tree/v0.70.1
