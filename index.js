'use strict';

const _ = require('lodash');
const immutable = require('immutable');

const pkg = require('./package.json');
const NAME = _.get(pkg, 'name');
const VERSION = _.get(pkg, 'version');

const { createLogger, createAPI } = require('./lib');

/**
 * Bootstrap the process provided in `options`
 * @param {Object} options Provides the information needed to load the correct process
 * @returns {void}
 */
module.exports = function bootstrap(options) {
	const { logLevel } = options;
	const logger = createLogger(logLevel);

	logger.info(`${NAME}#v${VERSION}:`, options);

	const commons = { _, immutable, logger };

	return createAPI(commons);
};
