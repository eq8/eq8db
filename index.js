'use strict';

const _ = require('lodash');
const map = require('immutable').Map;

const pkg = require('./package.json');
const NAME = _.get(pkg, 'name');
const VERSION = _.get(pkg, 'version');

const lib = require('./lib/index.js');

/**
 * Bootstrap the process provided in `options`
 * @param {Object} options Provides the information needed to load the correct process
 * @returns {void}
 */
module.exports = function bootstrap(options) {
	const logger = lib.getLogger(_.get(options, 'args.logLevel'));

	logger.info(`${NAME}#v${VERSION}:`, options);

	const kernel = lib.getKernel(logger);
	const proc = _.get(kernel, options.cmd) || (() => {
		logger.error(`Command ${options.cmd} not found!`);
	});

	proc(map(options.args));
};
