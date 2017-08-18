'use strict';

const _ = require('lodash');

const pkg = require('./package.json');
const createLogger = require('./lib/logger.js');
const initServicesLoader = require('./plugins');

const NAME = _.get(pkg, 'name');
const VERSION = _.get(pkg, 'version');

/**
 * The main function that signals the start of the application
 *
 * @param {string} [action] Runtime action - e.g. deploy, teardown, etc.
 * @param {Object} [options] Runtime options - i.e. log level and port
 * @returns {undefined}
 */
function bootstrap(action, options) {

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

	const framework = require('@eq8/framework')({ logger: { transports: [logger] } });

	// Initialize the services
	const commons = { VERSION, logger, framework };
	const loadServices = initServicesLoader(commons);

	// Loads services into framework
	loadServices(settings, services => {
		services.ready(function ready() {
			switch (action) {
			case 'process':
				this.act({ plugin: 'processor', cmd: 'start' });
				break;
			case 'deploy':
				this.act({ plugin: 'orchestrator', cmd: 'deploy' });
				break;
			case 'teardown':
				this.act({ plugin: 'orchestrator', cmd: 'teardown' });
				break;
			case 'serve':
			default:
				this.act({ plugin: 'server', cmd: 'start' }, err => {
					if (err) {
						logger.error(err);
					} else {
						logger.info(`Listening on port: ${settings.port}`);
					}
				});
				break;
			}
		});
	});
}

module.exports = bootstrap;
