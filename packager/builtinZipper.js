
const path = require('path')
const fs = require('fs')
const AdmZip = require("adm-zip");
const minimatch = require("minimatch")

function normalize(filePath) {
  var localPath = path.normalize(filePath);
  localPath = localPath.split("\\").join("/"); //windows fix
  if (localPath.charAt(localPath.length - 1) != "/") {
    localPath += "/";
  }
  return localPath;
}

function zip(opts) {
  console.log(JSON.stringify(opts));

  const listing = fs.readdirSync(opts.rootDir, { withFileTypes: true })

  const fileRegexes = []
  for (const exclude of opts.exclude) {
    fileRegexes.push(minimatch.makeRe(exclude));
  }

  var zip = new AdmZip();
  for (const fpath of listing) {
    var checkPath = path.resolve(opts.rootDir, fpath.name)
    if (fpath.isDirectory()) {
      checkPath = normalize(checkPath);
    }

    var skipEntry = false;
    for (const rex of fileRegexes) {
      if (rex.test(checkPath)) {
        console.log('[SKIP] ' + checkPath);
        skipEntry = true;
      }
    }

    if (!skipEntry) {
      if (fpath.isDirectory()) {
        zip.addLocalFolder(checkPath, fpath.name + "/")
      } else {
        zip.addFile(fpath.name, fs.readFileSync(checkPath));
      }

      console.log('> ' + checkPath)
    }
  }

  zip.writeZip(opts.destination)
}

module.exports.zip = zip;
