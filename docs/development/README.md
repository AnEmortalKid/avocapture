# Docs for developers of avocapture

## releasing

> Steps to release so i don't forget them

1. `git tag -a $TAG_VERSION`
2. `git checkout $TAG_VERSION`
3. Publish

## publishing

> Notes on manual publishing

### Env set on windows

#### Set certificate env vars when signing build

```bash
export WIN_CERT_FILE=pathToPFX
export WIN_CERT_PASS=plainTextPass
npm run make
```

#### Publish

_git bash_
```bash
export GITHUB_TOKEN=value
npm run publish
```

## Automated Publishing steps

1. If the desired version isn't set on the `package.json`, set it with `npm version major|minor|patch`
2. Draft a new release
3. Ensure it is set to `pre-release` (electron updater will check if isDraft | preRelease and skip)
4. Once the artifacts are attached, change pre-release to non-pre-release
5. Applications should execute the auto-update.

