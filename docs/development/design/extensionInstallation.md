# extension installation


## Zip vs NPM usage

Assuming everyone has `npm` is a bad assumption. The intent of this is to be used by not just developers. 
Asking a non-node user to install node is a bit rough. 

A zip file will work, as long as the node_modules are packaged with the extension as well. 

However, when developing, it may be nice to not require a zip, so we can support both mechanisms:

1. Load packaged (requires node_modules/package.json,files)
2. Load unpackaged (requires package.json/package-lock.json uses npm)

By default, we'll start by checking if it's a zip and the `builtin` extensions will be zipped when shipped.

So we'll use 2 mechanisms:

* is it a zip? ZipInstaller
* Is it a dir? NpmInstaller

For zips, this lib seems to allow us to peek the package.json https://www.npmjs.com/package/node-stream-zip
which is what we need to do basic install checks, get name etc. Those can be in a base class.