'use strict';

const _ = require('lodash');

const pkg = require('./package.json');
const { Logger } = require('./lib/utils');
const pluginsLoader = require('./plugins');

const NAME = _.get(pkg, 'name');
const VERSION = _.get(pkg, 'version');

const optionsWhitelist = [
	'stack', 'docker',
	'logLevel', 'store', 'apiPath', 'port', 'dev'
];

// hoist bootstrap function and export
module.exports = bootstrap;

/**
 * The main function that signals the start of the application
 *
 * @param {string} [action] Runtime action - e.g. deploy, teardown, etc.
 * @param {Object} [options] Runtime options - i.e. log level and port
 * @param {Function} [callback] Function to receive the service locator
 * @returns {undefined}
 */
function bootstrap(action, options, callback) {

	// Provide defaults
	const settings = _.defaultsDeep(_.pick(options, optionsWhitelist), {
		action,
		port: 8000,
		logLevel: 'info',
		dev: false
	});

	// Extract the settings
	const { logLevel } = settings;

	// Initialize the logger
	const logger = Logger(logLevel);

	logger.info(`${NAME}#v${VERSION}`, settings);

	// Initialize the framework
	const framework = require('@eq8/framework')({
		logger: { transports: [logger] }
	});

	// Provide the framework to the plugins loader
	const commons = { VERSION, logger, framework };
	const loadPlugins = pluginsLoader(commons);

	// Loads plugins into the framework
	loadPlugins(settings, plugins => {
		plugins.ready(function ready() {
			switch (action) {
			case 'process':
				this.act({ plugin: 'processor', cmd: 'start' }, callback);
				break;
			case 'deploy':
				this.act({ plugin: 'orchestrator', cmd: 'deploy' }, callback);
				break;
			case 'teardown':
				this.act({ plugin: 'orchestrator', cmd: 'teardown' }, callback);
				break;
			case 'serve':
			default:
				this.act({ plugin: 'server', cmd: 'start' }, callback);
				break;
			}
		});
	});
}
