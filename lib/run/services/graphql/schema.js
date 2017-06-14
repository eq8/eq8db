'use strict';

const { buildSchema } = require('graphql');

module.exports = function createSchema({ logger }) {
	logger.debug('createSchema');

	const schema = buildSchema(`
		type Query {
			version: String
		}
		
		type Result {
			code: String
			status: String
		}

		input Host {
			host: String
			port: String
		}
		
		type Mutation {
			addCluster(api: String, name: String, trx: Host, queue: Host, cache: Host, search: Host): Result
			addDatabase(api: String, name: String): Result
		}
		`);

	return schema;
};
