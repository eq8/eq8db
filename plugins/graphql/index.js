/* globals define, Promise */
'use strict';

define([
	'graphql-tools',
	'express-graphql',
	'-/logger/index.js',
	'-/store/index.js',
	'-/repository/index.js',
	'-/graphql/lib/index.js'
], ({ makeExecutableSchema }, graphqlHTTP, logger, store, repository, utils) => {
	const {
		getQueries,
		getMethods,
		getActions,
		getTypeDefs,
		getResolvers
	} = utils;

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

				const queries = getQueries(domain, args);
				const methods = getMethods(domain, args);
				const actions = getActions(domain, args);
				const typeDefsRaw = {
					queries,
					methods,
					actions
				};
				const typeDefs = getTypeDefs(typeDefsRaw);

				// TODO: remove repository concept and move into it's own service
				// - i.e. make every query a remote call and not in-memory
				const client = repository.connect(domain, args);
				const resolvers = getResolvers(client, typeDefsRaw);

				const schema = makeExecutableSchema({
					typeDefs,
					resolvers,
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

