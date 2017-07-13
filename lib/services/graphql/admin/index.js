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
				clusters: qEvent(services, 'clusters'),
				node: qEvent(services, 'node')
			},
			Cluster: {
				domains: qEvent(services, 'domains')
			},
			Domain: {
				databases: qEvent(services, 'databases')
			},
			Database: {
				aggregates: qEvent(services, 'aggregates'),
				entities: qEvent(services, 'entities'),
				values: qEvent(services, 'values')
			},
			Entity: {
				attributes: qEvent(services, 'attributes')
			},
			Node: {
				__resolveType(obj) {
					return obj.type;
				}
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
			}, (err, { data }) => {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	};
}
