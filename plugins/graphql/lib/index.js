/* globals define, Promise */
'use strict';

define([
	'lodash',
	'-/logger/index.js',
	'-/utils/index.js',
	'-/repository/index.js'
], (_, logger, { toImmutable }, repository) => {
	const plugin = {
		getTypeDefinitions,
		getResolvers
	};

	function getTypeDefinitions() {
		return `
			"""
			Sample documentation for Aggregate
			"""
			type Aggregate {
				version: Int
			}
			type Transaction {
				commit(readWrites: Boolean): Aggregate
			}
			type Query {
				load(id: String): Aggregate
			}
			type Mutation {
				begin(id: String): Transaction
			}
		`;
	}

	function getResolvers(domain, args) {
		const client = repository.connect(domain, args);

		return {
			Query: {
				load: getAggregate(client)
			},
			Mutation: {
				begin: getAggregate(client)
			},
			Aggregate: getAggregateResolvers(domain, args),
			Transaction: _.assign({
				commit: setAggregate(client)
			}, getTransactionResolvers(client, domain, args))
		};
	}

	function getAggregate(client) {
		return (obj, args) => new Promise((resolve, reject) => {
			logger.trace('resolver load:', args);

			const { id } = args;

			client
				.load(args, { create: true })
				.then(result => {
					const record = !_.isEmpty(result)
						? result
						: { id, version: 0 };

					logger.trace('resolver load result:', record);
					resolve(toImmutable(record));
				}, reject);
		});
	}

	function setAggregate(client) {
		return obj => {
			logger.trace('obj:', obj.toJSON());
			const changes = toImmutable({
				version: obj.get('version') + 1,
				meta: {
					lastUpdatedDate: new Date()
				}
			});

			const record = obj.mergeDeep(changes).toJSON();

			logger.trace('commit', record);

			return new Promise((resolve, reject) => {
				client.save(record)
					.then(result => resolve(result), reject);
			});
		};
	}

	function getAggregateResolvers() {
		return {
			version: obj => new Promise(resolve => resolve(obj.version || 0))
		};
	}

	function getTransactionResolvers() {
		return {};
	}

	return plugin;
});
