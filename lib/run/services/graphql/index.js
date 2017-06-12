'use strict';

const plugin = 'graphql';

const graphqlHTTP = require('express-graphql');
const semver = require('semver');

const schema = require('./schema.js')();

module.exports = function createGraphQLPlugin({ VERSION, logger }) {
	return function graphqlPlugin() {
		logger.debug('graphqlPlugin');

		const seneca = this;

		const ok = {
			code: '200',
			status: 'ok'
		};

		const MAJOR = semver.major(VERSION);
		const MINOR = semver.minor(VERSION);

		const rootValue = {
			version: () => `${MAJOR}.${MINOR}`,
			createDatabase: () => ok
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
