'use strict';

const plugin = 'graphql';

const { buildSchema } = require('graphql');

const graphqlHTTP = require('express-graphql');
const semver = require('semver');

module.exports = function createGraphQLPlugin({ logger }) {
	return function graphqlPlugin() {
		logger.trace('graphqlPlugin');

		const seneca = this;

		const schema = buildSchema(`
			type Query {
				version: String
			}

			type Result {
				success: Boolean,
				details: String
			}

			input Field {
				name: String,
				type: String
			}

			input Model {
				name: String,
				fields: [Field]
			}

			type Mutation {
				addModel(collection: String, model: Model): Result
			}
			`);

		const result = {
			success: true,
			details: ''
		};

		let schemaVersion = '0.0.0';

		const rootValue = {
			version: () => schemaVersion,
			addModel: () => {
				schemaVersion = semver.inc(schemaVersion, 'minor');

				return result;
			}
		};

		seneca.add({ plugin, cmd: 'subscribe', type: 'updates', db: 'admin' }, (args, done) => {
			const middleware = graphqlHTTP({ schema, rootValue, graphiql: true });

			done(null, { middleware });
		});

		seneca.add({ plugin, cmd: 'subscribe', type: 'updates' }, (args, done) => {
			done(null, { middleware: () => {} });
		});
	};
};
