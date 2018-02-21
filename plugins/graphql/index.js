/* globals define, Promise */
'use strict';

define([
	'graphql-tools',
	'express-graphql',
	'-/logger/index.js',
	'-/store/index.js',
	'-/graphql/lib/index.js'
], ({ makeExecutableSchema }, graphqlHTTP, logger, store, utils) => {
	const { getTypeDefinitions, getResolvers } = utils;

	const plugin = {
		middleware: args => new Promise((resolve, reject) => {

			/*
			 * TODO
			 * - construct schema based from database
			 * - construct rootValue from database to queue messages for the worker process
			 * - create a middleware and store in an LRU cache
			 *   - use the domain and schema version as the key
			 */

			const { domain: id } = args || {};

			if (!id) {
				return reject(new Error('Domain was not found'));
			}

			logger.trace(`reading domain info for ${id}`);

			return store.read({
				type: 'domain',
				id
			}).then(domain => {
				logger.trace('domain info found:', domain);

				const tmpTypeDefs = getTypeDefinitions(domain, args);
				const tmpResolvers = getResolvers(domain, args);

				const schema = makeExecutableSchema({
					typeDefs: tmpTypeDefs,
					resolvers: tmpResolvers,
					logger: {
						log: resolveError => logger.error(resolveError)
					}
				});

				const middleware = graphqlHTTP({
					schema,
					rootValue: {},
					graphiql: true
				});

				resolve(middleware);
			}, reject);
		})
	};

	return plugin;
});

