'use strict';

const _ = require('lodash');
const rjs = require('requirejs');

const optionsWhitelist = [
	'overrides',
	'stack', 'docker',
	'store', 'host', 'port', 'dev'
];

// hoist bootstrap function and export
module.exports = bootstrap;

/**
 * The main function that signals the start of the application
 *
 * @param {string} [cmd] Runtime command - e.g. deploy, teardown, etc.
 * @param {Object} [options] Runtime options - i.e. log level and port
 * @param {Function} [callback] Function to receive the service locator
 * @returns {undefined}
 */
function bootstrap(cmd, options) {

	// Provide defaults
	const settings = _.defaultsDeep(_.pick(options, optionsWhitelist), {
		cmd,
		port: 8000,
		dev: false
	});

	// Extract the settings
	const { docker, host, port, dev, store, overrides } = settings;

	rjs.config({
		map: overrides,
		nodeRequire: require
	});

	rjs([
		'utils/index.js',
		'plugins/orchestrator/index.js',
		'plugins/server/index.js'
	], ({ logger }, orchestrator, server) => {

		logger.info(settings);

		switch (cmd) {
		case 'deploy':
			orchestrator.deploy({ docker, port, dev });
			break;
		case 'teardown':
			orchestrator.teardown({ docker, port, dev });
			break;
		case 'serve':
		default:
			server.start({ store, host, port });
			break;
		}
	});
}
