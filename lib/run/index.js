'use strict';

module.exports = function createRunInstance(commons) {
	const { _, logger } = commons;
	const { server, log, api, graphql } = require('./services')(commons);
	const seneca = require('seneca')({
		legacy: {
			logging: false
		}
	});

	logger.debug('createRunInstance');

	return function run(options) {
		const settings = _.defaultsDeep(options, {
			port: 8000
		});

		logger.info('run:', settings);

		const { apiPath, port } = settings;

		seneca.use(log);
		seneca.use(server, { apiPath });
		seneca.use(api);
		seneca.use(graphql);

		seneca.ready(function ready() {
			this.act({ plugin: 'server', cmd: 'listen', port });
		});
	};
};
