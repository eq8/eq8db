/* globals Promise */

'use strict';

const plugin = 'graphql';

const { makeExecutableSchema } = require('graphql-tools');
const graphqlHTTP = require('express-graphql');

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

module.exports = function createGraphQLPlugin({ logger }) {
	return function graphqlPlugin() {
		const services = this;

		logger.debug('graphqlPlugin', __filename);

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

			const schema = makeExecutableSchema({ typeDefs: tmpTypeDefs, resolvers: tmpResolvers, logger });

			const middleware = graphqlHTTP({ schema, rootValue: {}, graphiql: true });

			done(null, {
				middleware
			});
		});
	};
};
