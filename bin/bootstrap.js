'use strict';

const _ = require('lodash');

const optionsWhitelist = [
	'store', 'port', 'overridesFile'
];

// hoist bootstrap function and export
module.exports = bootstrap;

/**
 * The main function that signals the start of the application
 *
 * @param {Object} [options] Runtime options - i.e. log level and port
 * @returns {undefined}
 */
function bootstrap(options) {

	// Provide defaults
	const settings = _.defaultsDeep(_.pick(options, optionsWhitelist), {
		port: 8000
	});

	// Extract the settings
	const { port, store, overridesFile } = settings;

	const overrides = overridesFile
		? require(overridesFile)
		: {};

	const mvp = require('..');

	mvp({ overrides }, (initError, { logger, api, server }) => {
		if (initError) {
			return logger.error(initError);
		}

		logger.info('settings', settings);

		return server.listen({ store, port }, listenError => {
			if (listenError) {
				return logger.error(listenError);
			}

			logger.info('server started');

			const repl = require('repl');

			return api({ store }, (err, apiInstance) => {
				if (err) {
					logger.error(err);
				}

				repl.start().context.api = apiInstance;
			});
		});
	});
}
