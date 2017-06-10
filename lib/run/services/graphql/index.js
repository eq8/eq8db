'use strict';

const plugin = 'graphql';

const { buildSchema } = require('graphql');

const graphqlHTTP = require('express-graphql');
const semver = require('semver');

module.exports = function createGraphQLPlugin({ VERSION, logger }) {
	return function graphqlPlugin() {
		logger.debug('graphqlPlugin');

		const seneca = this;

		const schema = buildSchema(`
			type Query {
				version: String
			}

			type Result {
				code: String
				status: String
			}

			type Mutation {
				createDatabase(api: String, name: String): Result
			}
			`);

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

		seneca.add({
			plugin, cmd: 'subscribe', type: 'updates', db: 'admin'
		}, (args, done) => done(null, { middleware }));

		seneca.add({ plugin, cmd: 'subscribe', type: 'updates' }, (args, done) => {
			done(null, { middleware: () => {} });
		});
	};
};
