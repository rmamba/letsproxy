const fs = require('fs')
const data = JSON.parse(fs.readFileSync('package.json').toString())
const __version__ = data.version
const __buildNumber__ = 'xxx'

module.exports = {
  version: __version__,
  build: __buildNumber__
}
