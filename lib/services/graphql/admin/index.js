/* globals Promise */

'use strict';

const plugin = 'graphql';

const semver = require('semver');
const { Map, List } = require('immutable');

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
				domain: getDomain(services)
			},
			Transaction: {
				addEntity: (obj, args) => new Promise((resolve, reject) => {
					try {
						const { name, attributes } = args;
						const entity = {
							name,
							attributes
						};

						obj = obj.set('entities', obj.get('entities').push(entity));

						resolve(obj);
					} catch (err) {
						reject(err);
					}
				}),
				addAggregate: (obj, args) => new Promise((resolve, reject) => {
					try {
						const { name } = args;

						obj = obj.set('aggregates', obj.get('aggregates').set(name, Map({})));

						resolve(obj);
					} catch (err) {
						reject(err);
					}
				}),
				end: obj => new Promise((resolve, reject) => {
					obj = obj.set('version', obj.get('version') + 1);

					const params = {
						type: 'domains',
						object: obj.toJSON()
					};

					services.act({ plugin: 'store', cmd: 'edit', params }, (err, result) => {
						if (err) {
							reject(err);
						} else {
							if (result.errors) {
								reject(result.first_error);
							} else {
								resolve(RESULT_OK);
							}
						}
					});
				})
			},
			Mutation: {
				begin: getDomain(services)
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

function getDomain(services) {
	return (obj, args, ctxt) => new Promise((resolve, reject) => {
		const id = _.get(ctxt, 'headers.host');
		const params = {
			type: 'domains',
			id
		};

		services.act({ plugin: 'store', q: 'read', params }, (err, result) => {
			if (result) {
				const { version, aggregates, entities } = result;

				if (err) {
					reject(err);
				} else {
					resolve(
						Map({
							id,
							version,
							aggregates: List(aggregates || []),
							entities: List(entities || [])
						})
					);
				}
			} else {
				resolve(
					Map({
						id,
						version: 0,
						aggregates: Map({}),
						entities: List([])
					})
				);
			}
		});
	});
}
