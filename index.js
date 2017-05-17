'use strict';

const _ = require('lodash');

const pkg = require('./package.json');
const NAME = _.get(pkg, 'name');
const VERSION = _.get(pkg, 'version');

const lib = require('./lib/index.js');

module.exports = function bootstrap(options) {
	const logger = lib.getLogger(_.get(options, 'args.logLevel'));

	logger.info(`${NAME}#v${VERSION}:`, options);

	const kernel = require('./lib/kernel.js')(logger);

	const proc = _.get(kernel, options.cmd) || (() => {
		logger.error(`Command ${options.cmd} not found!`);
	});

	proc(options);
};
