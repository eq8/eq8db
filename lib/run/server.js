'use strict';

const app = require('express')();
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

const semver = require('semver');

module.exports = function createServer({ _, logger }) {
	let middleware;
	let schemaVersion = '0.0.0';

	return function server(options) {
		const settings = _.defaultsDeep(options, {
			apiPath: '/api'
		});

		logger.info('server:', settings);

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

		const root = {
			version: () => schemaVersion,
			addModel: () => {
				schemaVersion = semver.inc(schemaVersion, 'minor');

				return result;
			}
		};

		const { apiPath } = settings;

		middleware = graphqlHTTP({
			schema,
			rootValue: root,
			graphiql: true
		});

		app.use(apiPath, (req, res, next) => {
			if (middleware) {
				return middleware(req, res, next);
			}

			return next();
		});

		return app;
	};
};
