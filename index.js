'use strict';

const _ = require('lodash');
const lib = require('./lib/index.js');

module.exports = function eq8store(options) {
	const logger = lib.getLogger(_.get(options, 'args.logLevel'));

	logger.debug('options:', options);
};
