'use strict';

const app = require('express')();
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

module.exports = function createServer({ _, logger }) {
	return function server(options) {
		const settings = _.defaultsDeep(options, {
			apiPath: '/api'
		});

		logger.info('server:', settings);

		const schema = buildSchema(`
			type Query {
				hello: String
			}
			`);

		const root = { hello: () => 'Hello world!' };

		const { apiPath } = settings;

		app.use(apiPath, graphqlHTTP({
			schema,
			rootValue: root,
			graphiql: true
		}));

		return app;
	};
};
