'use strict';

const plugin = 'graphql';

const { makeExecutableSchema } = require('graphql-tools');
const graphqlHTTP = require('express-graphql');

const { getVersion } = require('../utils.js');

module.exports = function createGraphQLAdminPlugin({ VERSION, logger }) {
	const v = getVersion(VERSION);

	return function graphqlAdminPlugin() {
		const services = this;

		logger.debug('graphqlPlugin');

		const typeDefs = require('./type-defs.js');

		const resolvers = require('./resolvers.js')(services);

		const rootValue = {};

		const schema = makeExecutableSchema({ typeDefs, resolvers, logger });

		const middleware = graphqlHTTP({ schema, rootValue, graphiql: true });

		/**
		 * returns the middleware for the admin API
		 */
		services.add({
			plugin, q: 'middleware', aggregate: 'admin', v
		}, (args, done) => done(null, { middleware }));
	};
};

