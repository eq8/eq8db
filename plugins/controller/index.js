/* globals define, Promise */
'use strict';

define([
	'graphql-tools',
	'express-graphql',
	'-/logger/index.js',
	'-/store/index.js',
	'-/controller/lib/index.js'
], ({ makeExecutableSchema }, graphqlHTTP, logger, store, utils) => {
	const {
		getQueries,
		getMethods,
		getActions,
		getEntities,
		getInputEntities,
		getRepository,
		getTypeDefs,
		getResolvers
	} = utils;

	const plugin = {
		middleware: args => new Promise((resolve, reject) => {

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
				const entities = getEntities(domain, args);
				const inputEntities = getInputEntities(domain, args);
				const repository = getRepository(domain, args);
				const typeDefsRaw = {
					queries,
					methods,
					actions,
					entities,
					inputEntities,
					repository
				};
				const typeDefs = getTypeDefs(typeDefsRaw);
				const resolvers = getResolvers(typeDefsRaw);

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

