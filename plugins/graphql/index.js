/* globals define, Promise */
'use strict';

define([
	'graphql-tools',
	'express-graphql',
	'utils/index.js'
], ({ makeExecutableSchema }, graphqlHTTP, { logger }) => {

	// TODO: replace me with actual dynamic type definitions and resolvers
	const tmpTypeDefs = `
	type Query {
		up: Boolean
	}
	`;
	const tmpResolvers = {
		Query: {
			up: () => Promise.resolve(true)
		}
	};

	return {
		middleware: (args, done) => {

			/*
			 * TODO
			 * - construct schema based from database
			 * - construct rootValue from database to queue messages for the worker process
			 * - create a middleware and store in an LRU cache
			 *   - use the domain and schema version as the key
			 */

			const schema = makeExecutableSchema({
				typeDefs: tmpTypeDefs,
				resolvers: tmpResolvers,
				logger: {
					log: err => logger.error(err)
				}
			});

			const middleware = graphqlHTTP({ schema, rootValue: {}, graphiql: true });

			done(null, {
				middleware
			});
		}
	};
});

