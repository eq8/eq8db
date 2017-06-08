'use strict';

const plugin = 'schema';

const { buildSchema } = require('graphql');
const semver = require('semver');

module.exports = function createSchemaPlugin({ logger }) {
	return function schemaPlugin() {
		logger.trace('schemaPlugin');

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

		seneca.add({ plugin, cmd: 'subscribe' }, ({ q }, done) => {
			switch (q) {
			case 'updates':
			default:
				done(null, { schema, rootValue });
			}
		});
	};
};
