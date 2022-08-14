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

