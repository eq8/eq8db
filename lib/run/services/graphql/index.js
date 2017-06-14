'use strict';

const plugin = 'graphql';

const graphqlHTTP = require('express-graphql');
const semver = require('semver');

module.exports = function createGraphQLPlugin(commons) {
	const { VERSION, logger } = commons;
	const schema = require('./schema.js')({ logger });

	return function graphqlPlugin() {
		const seneca = this;

		logger.debug('graphqlPlugin');

		const { addCluster, addDatabase } = require('./resolvers')(commons, seneca);

		const MAJOR = semver.major(VERSION);
		const MINOR = semver.minor(VERSION);

		const rootValue = {
			version: () => `${MAJOR}.${MINOR}`,
			addCluster,
			addDatabase
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
