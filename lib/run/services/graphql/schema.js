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
		
		type Mutation {
			addDatabase(api: String, name: String): Result
		}
		`);

	return schema;
};
