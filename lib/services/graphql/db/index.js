'use strict';

const plugin = 'graphql';

module.exports = function createGraphQLDBPlugin({ logger }) {
	return function graphqlDBPlugin() {
		const services = this;

		logger.debug('graphqlDBPlugin');

		/**
		 * returns the middleware other than the admin API
		 */
		services.add({ plugin, q: 'middleware' }, (args, done) => {

			/*
			 * TODO
			 * - construct schema based from database
			 * - construct rootValue from database to queue messages for the worker process
			 * - create a middleware and store in an LRU cache
			 *   - use the domain and schema version as the key
			 */
			done(null, {
				middleware: (req, res, next) => {
					next();
				}
			});
		});
	};
};
