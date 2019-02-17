const fs = require('fs');
const data = JSON.parse(fs.readFileSync('package.json').toString());
const __version__ = data.version;
const __build_number__ = 'xxx';

module.exports = {
    version: __version__,
    build: __build_number__
};
