'use strict';

const _ = require('lodash');

const createLogger = require('./logger.js');
const initServicesLoader = require('./services');

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
	 * @param {string} [action] Runtime action - e.g. deploy, teardown, etc.
	 * @param {Object} [options] Runtime options - i.e. log level and port
	 * @returns {undefined}
	 */
	return function run(action, options) {

		// Provide defaults
		const settings = _.defaultsDeep(options, {
			action,
			port: 8000,
			logLevel: 'info',
			dev: false
		});

		// Extract the settings
		const { logLevel } = settings;

		// Initialize the logger
		const logger = createLogger(logLevel);

		logger.info(`Started ${NAME}#v${VERSION}:`, settings);

		// Initialize the services
		const commons = { VERSION, logger, seneca };
		const loadServices = initServicesLoader(commons);

		// Loads services into seneca
		loadServices(settings, services => {
			services.ready(function ready() {
				switch (action) {
				case 'start':
					this.act({ plugin: 'processor', cmd: 'start' });
					break;
				case 'deploy':
					this.act({ plugin: 'orchestrator', cmd: 'deploy' });
					break;
				case 'teardown':
					this.act({ plugin: 'orchestrator', cmd: 'teardown' });
					break;
				case 'listen':
				default:
					this.act({ plugin: 'server', cmd: 'listen' });
					break;
				}
			});
		});
	};
};
