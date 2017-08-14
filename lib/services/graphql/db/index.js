'use strict';

const plugin = 'graphql';

const _ = require('lodash');
const lru = require('lru-cache');

const LRU_MAXSIZE = !_.isNaN(parseInt(process.env.LRU_MAXSIZE, 10))
	? parseInt(process.env.LRU_MAXSIZE, 10)
	: 500;
const LRU_MAXAGE = !_.isNaN(parseInt(process.env.LRU_MAXAGE, 10))
	? parseInt(process.env.LRU_MAXAGE, 10)
	: 1000 * 60 * 60;

module.exports = function createGraphQLDBPlugin({ logger }) {
	return function graphqlDBPlugin(options) {
		const services = this;

		const settings = _.defaultsDeep(options, {
			max: LRU_MAXSIZE,
			length: (n, key) => n * 2 + key.length,
			dispose: (key, n) => n.close(),
			maxAge: LRU_MAXAGE
		});
		const cache = lru(settings.cache);

		logger.debug('graphqlDBPlugin');

		/**
		 * returns the middleware other than the admin API
		 */
		services.add({ plugin, q: 'middleware', aggregate: 'db' }, (args, done) => {

			/*
			 * TODO
			 * - construct schema based from database
			 * - construct rootValue from database to queue messages for the worker process
			 * - create a middleware and store in an LRU cache
			 *   - use the domain and schema version as the key
			 */
			done(null, {
				middleware: (req, res, next) => {
					const domain = _.get(req, 'headers.host');
					const cached = cache.get(domain);

					let middleware = cached
						? cached
						: getDbAggregate(services);

					if (!middleware) {
						middleware = getDbAggregate(services);

						cache.set(domain, middleware);
					}

					middleware(req, res, next);
				}
			});
		});
	};
};

function getDbAggregate(/* services */) {
	return (req, res) => {
		req.write('hello world!');
		res.end();
	};
}
