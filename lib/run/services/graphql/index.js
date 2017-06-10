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
				success: Boolean
				details: String
			}

			input Index {
				name: String
				type: String
			}

			input Field {
				name: String
				type: String,
				index: Index
			}

			input Model {
				name: String
				fields: [Field]
			}

			type Mutation {
				addDatabase(api: String, name: String): Result
				addModel(api: String, collection: String, model: Model): Result
				addField(api: String, model: String, field: Field): Result
			}
			`);

		const result = {
			success: true,
			details: ''
		};

		const MAJOR = semver.major(VERSION);
		const MINOR = semver.minor(VERSION);

		const rootValue = {
			version: () => `${MAJOR}.${MINOR}`,
			addDatabase: () => result,
			addModel: () => result,
			addField: () => result
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
