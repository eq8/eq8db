'use strict';

const plugin = 'api';

module.exports = function createApiPlugin(commons) {
	const { logger } = commons;

	const defaultHandler = require('./default.js')(commons);

	return function apiPlugin() {
		const seneca = this;

		logger.debug('apiPlugin');

		seneca.add({ plugin, type: 'cmd' }, defaultHandler);
		seneca.add({ plugin, type: 'q' }, defaultHandler);
	};
};
