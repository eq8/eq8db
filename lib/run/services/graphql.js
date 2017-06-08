'use strict';

const plugin = 'graphql';

const graphqlHTTP = require('express-graphql');

module.exports = function createGraphQLPlugin({ logger }) {
	let middleware;

	return function graphqlPlugin() {
		const seneca = this;

		seneca.add({ plugin, cmd: 'request' }, ({ req, res }, done) => {
			if (middleware) {
				middleware(req, res);
			}

			return done();
		});

		seneca.act({
			plugin: 'schema', cmd: 'subscribe', q: 'updates'
		}, (err, { schema, rootValue }) => {
			if (err) {
				logger.error(err);
			} else {
				middleware = graphqlHTTP({ schema, rootValue, graphiql: true });
			}
		});
	};
};
