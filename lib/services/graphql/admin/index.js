/* globals Promise */

'use strict';

const plugin = 'graphql';

const semver = require('semver');
const { makeExecutableSchema } = require('graphql-tools');
const graphqlHTTP = require('express-graphql');
const RESULT_OK = {
	code: 200,
	description: 'ok'
};

const _ = require('lodash');

module.exports = function createGraphQLAdminPlugin({ VERSION, logger }) {
	const MAJOR = semver.major(VERSION);
	const MINOR = semver.minor(VERSION);
	const v = `v${MAJOR}.${MINOR}`;

	return function graphqlAdminPlugin() {
		const services = this;

		logger.debug('graphqlPlugin');

		const typeDefs = require('./type-defs.js');

		const resolvers = {
			Query: {
				aggregates: browse(services, 'aggregates'),
				entities: browse(services, 'entities')
			},
			Entity: {
				attributes: browse(services, 'attributes')
			},
			Mutation: {
				addAggregate: (obj, args, ctxt) => new Promise((resolve, reject) => {
					const { name } = args;
					const domain = getDomain(ctxt);
					const params = {
						type: 'aggregates',
						objects: [
							{
								domain,
								name,
								version: '0.0.0'
							}
						]
					};

					// TODO: add unique constraint for the aggregate name within a domain
					// TODO: add access control based on the user context
					services.act({ plugin: 'store', cmd: 'add', params }, err => {
						if (err) {
							reject(err);
						} else {
							resolve(RESULT_OK);
						}
					});
				}),
				addEntity: (obj, args, ctxt) => new Promise((resolve, reject) => {
					const { name } = args;
					const domain = getDomain(ctxt);
					const params = {
						type: 'entities',
						objects: [
							{
								domain,
								name
							}
						]
					};

					// TODO: add access control based on the user context
					services.act({ plugin: 'store', cmd: 'add', params }, err => {
						if (err) {
							reject(err);
						} else {
							resolve(RESULT_OK);
						}
					});
				})
			}
		};

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

function browse(services, type) {
	return function resolver(obj, args /* , ctxt */) {
		return new Promise((resolve, reject) => {
			const { skip, limit } = args;
			let where;

			if (type === 'attributes') {
				where = {
					entity: obj.id
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

function getDomain(ctxt) {
	return _.get(ctxt, 'headers.host');
}
