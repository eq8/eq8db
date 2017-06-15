'use strict';

const winston = require('winston');
const Logger = winston.Logger;

module.exports = {
	createLogger(logLevel) {
		return new Logger({
			levels: {
				trace: 5, debug: 4, info: 3, warn: 2, error: 1, fatal: 0
			},
			colors: {
				trace: 'grey',
				debug: 'blue',
				info: 'green',
				warn: 'yellow',
				error: 'red',
				fatal: 'magenta'
			},
			transports: [
				new (winston.transports.Console)({
					level: logLevel || 'info',
					timestamp: () => (new Date()).toISOString(),
					colorize: true
				})
			]
		});
	},
	createInstance(commons) {
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
	}
};

