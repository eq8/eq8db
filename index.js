'use strict';

const pkg = require('./package.json');
const createInstance = require('./lib');

module.exports = createInstance(pkg);
