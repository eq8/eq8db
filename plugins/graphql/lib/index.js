/* globals define, Promise */
'use strict';

define([
	'lodash',
	'uuid/v4',
	'immutable',
	'-/utils/index.js'
], (_, uuidv4, { Map, List }, { toImmutable }) => {
	const plugin = {
		getQueries,
		getMethods,
		getActions,
		getTypeDefs,
		getResolvers
	};

	const LF = '\n';

	function getQueries(domain, args) {
		const { bctxt, aggregate, v } = args || {};
		const queryPath = `boundedContexts[${bctxt}].aggregates[${aggregate}].versions[${v}].queries`;

		return _.get(domain, queryPath);
	}

	function getMethods() {
		return {
			isValid: {
				returnType: 'Boolean'
			}
		};
	}

	function getActions() {
		return {
			isValid: {
				returnType: 'Boolean'
			}
		};
	}

	function getTypeDefs(args) {
		const queries = _.assign({
			transact: {
				returnType: 'Transaction',
				params: {
					options: 'TransactOptions'
				}
			}
		}, _.mapValues(_.get(args, 'queries'), query => _.defaultsDeep({ returnType: '[Aggregate]' }, query)));

		const methods = _.assign({
			version: {
				returnType: 'Int'
			}
		}, _.get(args, 'methods'));

		const actions = _.assign({
			id: {
				returnType: 'ID'
			},
			commit: {
				returnType: 'Result',
				params: {
					options: 'CommitOptions'
				}
			}
		}, _.get(args, 'actions'));

		const typeDefQuery = getTypeDef('Query', queries);
		const typeDefAggregate = getTypeDef('Aggregate', methods);
		const typeDefTransaction = getTypeDef('Transaction', actions);

		const typeDef = `
"""
Sample documentation for Aggregate
"""
${typeDefAggregate}

${typeDefTransaction}

${typeDefQuery}

type Result {
	id: ID!
	success: Boolean
}

input TransactOptions {
	subscribe: Boolean
}

input CommitOptions {
	wait: Boolean
	timeout: Int
}
`;

		return typeDef;
	}

	function getTypeDef(type, queries) {
		const queryDefs = getQueryDefs(queries);

		return `type ${type} {${LF}${queryDefs}${LF}}${LF}`;
	}

	function getQueryDefs(queries) {
		let typeDefinitionQueries = '';

		_.each(_.keys(queries || {}), name => {
			const query = _.get(queries, name);
			const params = getQueryParams(_.get(query, 'params'));
			const returnType = _.get(query, 'returnType') || 'Aggregate'; // TODO: remove and validate

			// TODO populate related <Entities>, Queries, Mutations
			typeDefinitionQueries = `${typeDefinitionQueries}${name}${params}: ${returnType}${LF}`;
		});

		return typeDefinitionQueries;
	}

	function getQueryParams(args) {
		let typeDefinitionQueryParams = '';

		_.each(_.keys(args), name => {

			// TODO: remove default and replace with validation
			const type = _.get(args, name) || '[Aggregate]';

			typeDefinitionQueryParams = `${typeDefinitionQueryParams}${name}:${type},`;
		});

		return typeDefinitionQueryParams ? `(${typeDefinitionQueryParams})` : '';
	}

	function getResolvers(typeDefsRaw) {
		const { actions } = typeDefsRaw;

		return {
			Query: _.assign({
				transact: getTransaction()
			}, getQueryResolvers()),
			Aggregate: getMethodResolvers(),
			Result: getResultResolvers(),
			Transaction: _.assign({
				commit
			}, getTransactionResolvers(actions))
		};
	}

	function getTransaction() {
		return (obj, args, rawCtxt) => {
			const id = uuidv4();

			const ctxt = toImmutable(_.pick(rawCtxt, [
				'baseUrl',
				'cookies',
				'hostname',
				'ip',
				'method',
				'originalUrl',
				'params',
				'path',
				'protocol',
				'query',
				'route',
				'user'
			]));

			// TODO: extract repository info
			return Promise.resolve(Map({
				id,

				// repository,
				ctxt,

				tasks: List([])
			}));
		};
	}

	function commit(obj) {
		const result = Map({
			id: obj.get('id'),
			tasks: obj.get('tasks').toJSON() || []
		});

		return Promise.resolve(result);
	}

	function getQueryResolvers() {
		return {
			load: () => [{ version: 1 }, { version: 2 }]
		};
	}

	function getMethodResolvers() {
		return {
			version: obj => Promise.resolve(_.get(obj, 'version') || 0)
		};
	}

	function getResultResolvers() {
		return {
			id: obj => Promise.resolve(obj.get('id'))
		};
	}

	function getTransactionResolvers() {
		return {};
	}

	return plugin;
});
