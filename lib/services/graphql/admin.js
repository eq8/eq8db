/* globals Promise */

'use strict';

const graphqlHTTP = require('express-graphql');
const semver = require('semver');

module.exports = function createGraphQLAdminPlugin({ VERSION, logger }) {
	const schema = require('./schema.js')({ logger });

	return function graphqlAdminPlugin({ plugin }) {
		const seneca = this;

		logger.debug('graphqlPlugin');

		const MAJOR = semver.major(VERSION);
		const MINOR = semver.minor(VERSION);

		const rootValue = {
			version: () => `${MAJOR}.${MINOR}`,
			clusters: () => ([{
				id: 'cluster-id',
				name: 'cluster-name',
				domains: [
					{
						id: 'domain-id',
						name: 'domain-name',
						databases: [
							{
								id: 'database-id',
								name: 'database-name',
								warehouse: 'warehouse'
							}
						]
					}
				]
			}]),
			addCluster: cmdEvent(MAJOR, seneca, 'add-cluster'),
			addDomain: cmdEvent(MAJOR, seneca, 'add-domain'),
			addDatabase: cmdEvent(MAJOR, seneca, 'add-database')
		};

		const middleware = graphqlHTTP({ schema, rootValue, graphiql: true });

		/**
		 * returns the middleware for the admin API
		 */
		seneca.add({
			plugin, q: 'middleware', db: 'admin'
		}, (args, done) => done(null, { middleware }));
	};
};

function cmdEvent(v, seneca, cmd) {
	return function resolver(obj, args, ctxt) {
		return new Promise((resolve, reject) => {
			seneca.act({
				plugin: 'api', v, type: 'cmd', cmd, obj, args, ctxt
			}, (err, { code, status }) => {
				if (err) {
					reject(err);
				} else {
					resolve({ code, status });
				}
			});
		});
	};
}
