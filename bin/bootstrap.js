'use strict';

// hoist bootstrap function and export
module.exports = bootstrap;

/**
 * The main function that signals the start of the application
 * Basically wraps the MVP library
 *
 * @param {Object} [args] CLI arguments
 * @returns {undefined}
 */
async function bootstrap(args) {

	// Extract the settings
	const { overridesFile } = args || {};

	const overrides = overridesFile
		? require(overridesFile)
		: {};

	const mvp = require('..');

	// Call MVP with a set of options from the CLI which initializes the core components of MVP:
	// - Logger
	// - API
	// - HTTP server
	const { options, logger, store, server } = await mvp({ overrides });
	const { port, storeUri, retryInterval } = options.init(args);

	logger.info('initialized', { overrides });

	try {
		const { success } = await server.listen({ port }) || {};

		logger.info('server is listening', { port, success });
	} catch (err) {
		logger.error('server unable to listen', { port, err });
		process.exitCode = 1;
	}

	connect();

	async function connect(callback) {
		try {
			const { success } = await store.connect({ storeUri }) || {};

			logger.info('store has connected', { storeUri, success });

			server.setState('ready'); // TODO: replace with connected, ready if db was created
		} catch (err) {
			logger.error('store unable to connect', { storeUri, err });
			setTimeout(connect, retryInterval, callback);
		}
	}
}
