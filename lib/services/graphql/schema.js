'use strict';

const { buildSchema } = require('graphql');

module.exports = function createSchema({ logger }) {
	logger.debug('createSchema');

	const schema = buildSchema(`
		type Database {
			id: String
			name: String
			warehouse: String
		}

		type Domain {
			id: String
			name: String
			databases(api: String!, id: String): [Database]
		}

		type Cluster {
			id: String
			name: String
			domains(api: String!, id: String): [Domain]
			trx: String
			queue: String
			cache: String
			search: String
		}

		type Query {
			version: String
			clusters(api: String): [Cluster]
		}
		
		input InputTrxHost {
			host: String
			port: String
			username: String
			password: String
		}

		input InputHost {
			host: String
			port: String
		}

		type Result {
			code: String
			status: String
		}
		
		type Mutation {
			addCluster(api: String!, name: String!, trx: InputTrxHost!, queue: InputHost!, cache: InputHost!, search: InputHost!): Result
			addDomain(api: String!, name: String!, cluster: String!): Result
			addDatabase(api: String!, name: String!, domain: String!, warehouse: InputHost): Result
		}
		`);

	return schema;
};
