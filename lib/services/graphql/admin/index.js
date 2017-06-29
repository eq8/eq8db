/* globals Promise */

'use strict';

const plugin = 'graphql';

const { makeExecutableSchema } = require('graphql-tools');
const graphqlHTTP = require('express-graphql');

module.exports = function createGraphQLAdminPlugin({ logger }) {
	return function graphqlAdminPlugin() {
		const services = this;

		logger.debug('graphqlPlugin');

		const typeDefs = require('./type-defs.js');

		const resolvers = {
			Query: {
				version: qEvent(services, 'version'),
				clusters: qEvent(services, 'clusters')
			},
			Cluster: {
				domains: qEvent(services, 'domains')
			}
		};

		const rootValue = {};

		const schema = makeExecutableSchema({ typeDefs, resolvers, logger });

		const middleware = graphqlHTTP({ schema, rootValue, graphiql: true });

		/**
		 * returns the middleware for the admin API
		 */
		services.add({
			plugin, q: 'middleware', db: 'admin'
		}, (args, done) => done(null, { middleware }));
	};
};

function qEvent(services, q) {
	return function resolver(obj, args, ctxt) {
		return new Promise((resolve, reject) => {
			services.act({
				plugin: 'api', type: 'q', q, obj, args, ctxt
			}, (err, result) => {
				if (err) {
					reject(err);
				} else {
					resolve(result[q]);
				}
			});
		});
	};
}
