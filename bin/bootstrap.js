'use strict';

const _ = require('lodash');

const optionsWhitelist = [
	'storeUri', 'port', 'retryInterval', 'overridesFile'
];

// hoist bootstrap function and export
module.exports = bootstrap;

/**
 * The main function that signals the start of the application
 * Basically wraps the MVP library
 *
 * @param {Object} [options] Runtime options - i.e. log level and port
 * @returns {undefined}
 */
function bootstrap(options) {

	// Provide defaults
	const settings = _.defaultsDeep(_.pick(options, optionsWhitelist), {
		port: 8000,
		retryInterval: 1000
	});

	// Extract the settings
	const { port, storeUri, retryInterval, overridesFile } = settings;

	const overrides = overridesFile
		? require(overridesFile)
		: {};

	const mvp = require('..');

	// Call MVP with a set of options from the CLI which initializes the core components of MVP:
	// - Logger
	// - API
	// - HTTP server
	mvp({ overrides }, (initError, { logger, store, server }) => {
		if (initError) {
			return logger.error('unable to initialize', { overrides, err: initError });
		}

		logger.info('initialized', { overrides });

		return server.listen({ port }, listenError => {
			if (listenError) {
				return logger.error('server unable to listen', { port, err: listenError });
			}

			logger.info('server is listening', { port });

			let retryTimerId;

			function connect(callback) {
				store
					.connect({ storeUri })
					.then(() => {
						if (retryTimerId) {
							clearTimeout(retryTimerId);
						}

						server.setState('ready'); // TODO: replace with connected, ready if db was created

						callback();
					}, err => {
						logger.error('store unable to connect', { storeUri, err });
						retryTimerId = setTimeout(connect, retryInterval, callback);
					});
			}

			return connect(() => {
				logger.info('store has connected', { storeUri });
			});
		});
	});
}
