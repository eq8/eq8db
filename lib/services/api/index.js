'use strict';

const plugin = 'api';

module.exports = function createApiPlugin(commons) {
	const { logger } = commons;

	const addCluster = require('./add-cluster.js')(commons);
	const addDatabase = require('./add-database.js')(commons);

	return function apiPlugin() {
		const seneca = this;

		logger.debug('apiPlugin');

		seneca.add({ plugin, cmd: 'add-cluster' }, addCluster);
		seneca.add({ plugin, cmd: 'add-database' }, addDatabase);
	};
};
