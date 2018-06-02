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

	const LF = '\n';

	function getTypeDefinitions(domain, args) {
		const typeDefinitionQueries = getTypeDefinition(domain, _.assign({ type: 'queries' }, args));
		const typeDefinitionMethods = getTypeDefinition(domain, _.assign({ type: 'methods' }, args));
		const typeDefinitionActions = getTypeDefinition(domain, _.assign({ type: 'actions' }, args));

		const typeDef = `
"""
Sample documentation for Aggregate
"""
type Aggregate {
	version: Int
${typeDefinitionMethods}
}

type Transaction {
${typeDefinitionActions}
	commit(readWrites: Boolean): Aggregate
}

type Query {
	load(id: String): Aggregate
${typeDefinitionQueries}
	transact(id: String): Transaction
}
		`;

		return typeDef;
	}

	function getTypeDefinition(domain, args) {
		const { bctxt, aggregate, v, type } = args || {};

		const queryPath = `boundedContexts[${bctxt}].aggregates[${aggregate}].versions[${v}][${type}]`;
		const queries = _.get(domain, queryPath);

		let typeDefinitionQueries = '';

		_.each(_.keys(queries), name => {
			const query = _.get(queries, name);
			const params = getTypeDefinitionQueryParams(_.get(query, 'params'));
			const returnType = _.get(query, 'returnType') || 'Aggregate'; // TODO: remove and validate

			// TODO populate related <Entities>, Queries, Mutations
			typeDefinitionQueries = `${typeDefinitionQueries}${name}${params}: ${returnType}${LF}`;
		});

		return typeDefinitionQueries;
	}

	function getTypeDefinitionQueryParams(args) {
		let typeDefinitionQueryParams = '';

		_.each(_.keys(args), name => {

			// TODO: remove default and replace with validation
			const type = _.get(args, name) || 'Aggregate';

			typeDefinitionQueryParams = `${typeDefinitionQueryParams}${name}:${type},`;
		});

		return typeDefinitionQueryParams ? `(${typeDefinitionQueryParams})` : '';
	}

	function getResolvers(domain, args) {
		const client = repository.connect(domain, args);

		return {
			Query: {
				load: getAggregate(client),
				transact: getAggregate(client)
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
