/* globals Promise */

'use strict';

const plugin = 'graphql';

const graphqlHTTP = require('express-graphql');
const semver = require('semver');

module.exports = function createGraphQLPlugin({ VERSION, logger }) {
	const schema = require('./schema.js')({ logger });

	return function graphqlPlugin() {
		const seneca = this;

		logger.debug('graphqlPlugin');

		const MAJOR = semver.major(VERSION);
		const MINOR = semver.minor(VERSION);

		const rootValue = {
			version: () => `${MAJOR}.${MINOR}`,
			addCluster: dispatch(seneca, 'add-cluster'),
			addDatabase: dispatch(seneca, 'add-database')
		};

		const middleware = graphqlHTTP({ schema, rootValue, graphiql: true });

		/**
		 * returns the middleware for the admin API
		 */
		seneca.add({
			plugin, q: 'middleware', db: 'admin'
		}, (args, done) => done(null, { middleware }));

		/**
		 * returns the middleware other than the admin API
		 */
		seneca.add({ plugin, q: 'middleware' }, (args, done) => {
			done(null, { middleware: () => {} });
		});
	};
};

function dispatch(seneca, cmd) {
	return function resolver(obj, args, ctxt) {
		return new Promise((resolve, reject) => {
			seneca.act({
				plugin: 'api', cmd: `${cmd}`, args, ctxt
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
