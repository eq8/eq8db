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
				version: (obj, args, ctxt) => new Promise((resolve, reject) => {
					services.act({
						plugin: 'api', type: 'q', q: 'version', obj, args, ctxt
					}, (err, { data }) => {
						if (err) {
							reject(err);
						} else {
							resolve(data);
						}
					});
				}),
				clusters: browse(services, 'clusters'),
				node: read(services, 'node')
			},
			Cluster: {
				domains: browse(services, 'domains')
			},
			Domain: {
				databases: browse(services, 'databases')
			},
			Database: {
				aggregates: browse(services, 'aggregates'),
				entities: browse(services, 'entities'),
				values: browse(services, 'values')
			},
			Entity: {
				attributes: browse(services, 'attributes')
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

function browse(services, type) {
	return function resolver(obj, args /* , ctxt */) {
		return new Promise((resolve, reject) => {
			const { skip, limit } = args;
			let where;

			if (type === 'attributes') {
				where = {
					entity: obj.entity
				};
			}

			// TODO: check skip and limit input if valid

			const params = {
				type,
				where,
				skip,
				limit
			};

			const data = [];

			services.act({ plugin: 'store', q: 'browse', params }, (err, cursor) => {
				if (err) {
					reject(err);
				} else {
					cursor.eachAsync(row => {
						data.push(row);
					})
						.then(() => resolve(data))
						.catch(reject);
				}
			});
		});
	};
}

function read(services) {
	return function resolver(obj, args /* , ctxt */) {
		return new Promise((resolve, reject) => {
			const { type, id } = args;
			const storeTypeMap = {
				Cluster: 'clusters',
				Domain: 'domains',
				Database: 'databases',
				Aggregate: 'aggregates',
				Entity: 'entities',
				Attribute: 'attributes',
				Value: 'values'
			};
			const params = {
				type: storeTypeMap[type],
				id
			};

			services.act({ plugin: 'store', q: 'read', params }, (err, data) => {
				if (err) {
					reject(err);
				} else {
					data.type = type;
					resolve(data);
				}
			});
		});
	};
}
