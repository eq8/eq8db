'use strict';

const plugin = 'graphql';

const { makeExecutableSchema } = require('graphql-tools');
const graphqlHTTP = require('express-graphql');

const { getVersion } = require('../utils.js');

module.exports = function createGraphQLAdminPlugin({ api }) {

	// strips out the patch version
	const v = getVersion(api.version());

	return function graphqlAdminPlugin() {
		const services = this;

		services.log.debug('graphqlAdminPlugin', __filename);

		const typeDefs = require('./type-defs.js');

		const rootValue = {};

		/**
		 * returns the middleware for the admin API
		 */
		services.add({
			plugin, q: 'middleware', bctxt: 'admin', aggregate: 'domain', v
		}, ({ host }, done) => {
			const resolvers = require('./resolvers.js')(services, host);
			const logger = {
				log: err => services.log.error(err)
			};
			const schema = makeExecutableSchema({ typeDefs, resolvers, logger });
			const middleware = graphqlHTTP({ schema, rootValue, graphiql: true });

			done(null, { middleware });
		});
	};
};

