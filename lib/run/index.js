'use strict';

module.exports = function createRunInstance(commons) {
	const { _, logger } = commons;
	const { server, log, schema, graphql } = require('./services')(commons);
	const seneca = require('seneca')({
		legacy: {
			logging: false
		}
	});

	return function run(options) {
		const settings = _.defaultsDeep(options, {
			port: 8000
		});

		logger.info('run:', settings);

		const { apiPath, port } = settings;

		seneca.use(log);
		seneca.use(server, { apiPath });
		seneca.use(schema);
		seneca.use(graphql);

		seneca.ready(function ready() {
			this.act({ plugin: 'server', cmd: 'listen', port });
		});
	};
};
