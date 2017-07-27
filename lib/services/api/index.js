'use strict';

const plugin = 'api';

const semver = require('semver');

module.exports = function createApiPlugin(commons) {
	const { VERSION, logger } = commons;

	// const defaultHandler = require('./default.js')(commons);

	const MAJOR = semver.major(VERSION);
	const MINOR = semver.minor(VERSION);

	return function apiPlugin() {
		const services = this;

		logger.debug('apiPlugin');

		services.add({ plugin, type: 'q', q: 'version' }, (args, done) => {
			done(null, { data: `${MAJOR}.${MINOR}` });
		});
	};
};
