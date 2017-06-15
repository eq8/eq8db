'use strict';

const _ = require('lodash');
const Immutable = require('immutable');
const Rx = require('rx');

const createLogger = require('./logger.js');
const initServices = require('./services');

const seneca = require('seneca')({
	legacy: {
		logging: false
	}
});

/**
 * Creates an instance of the run function which is used to start the application
 *
 * @param {Object} pkg Contents of the package.json
 * @returns {Function} The main function to start the application
 */
module.exports = function createInstance(pkg) {
	const NAME = _.get(pkg, 'name');
	const VERSION = _.get(pkg, 'version');

	/**
	 * The main function that signals the start of the application
	 *
	 * @param {Object} [options] Runtime options - i.e. log level and port
	 * @returns {undefined}
	 */
	return function run(options) {

		// Provide defaults
		const settings = _.defaultsDeep(options, {
			logLevel: 'info',
			port: 8000
		});

		// Extract the settings
		const { logLevel, apiPath, port } = settings;

		// Initialize the logger
		const logger = createLogger(logLevel);

		logger.info(`Started ${NAME}#v${VERSION}:`, settings);

		// Initialize the services
		const commons = { _, Immutable, Rx, logger, VERSION };
		const { log, server, api, graphql } = initServices(commons);

		// Load the services
		seneca.use(log);
		seneca.use(server, { apiPath });
		seneca.use(api);
		seneca.use(graphql);

		// Start the server when all the services are ready
		seneca.ready(function ready() {
			this.act({ plugin: 'server', cmd: 'listen', port });
		});
	};
};
