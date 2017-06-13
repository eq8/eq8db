'use strict';

const plugin = 'api';

module.exports = function createApiPlugin(commons) {
	const { logger } = commons;

	const addDatabase = require('./add-database.js')(commons);

	return function apiPlugin() {
		const seneca = this;

		logger.debug('apiPlugin');

		seneca.add({ plugin, cmd: 'add-database' }, addDatabase);
	};
};
