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
		getRepository,
		getTypeDefs,
		getResolvers
	};

	const LF = '\n';

	function getQueries(domain, args) {
		const { bctxt, aggregate, v } = args || {};
		const queryPath = `boundedContexts[${bctxt}].aggregates[${aggregate}].versions[${v}].queries`;
		const queries = _.get(domain, queryPath);

		return _.mapValues(
			queries,
			query => _.assign({}, query, { returnType: '[Aggregate]' })
		);
	}

	function getMethods() {
		return {
			isValid: {
				returnType: 'Boolean'
			}
		};
	}

	function getActions(domain, args) {
		const { bctxt, aggregate, v } = args || {};
		const actionPath = `boundedContexts[${bctxt}].aggregates[${aggregate}].versions[${v}].actions`;

		return _.mapValues(
			_.get(domain, actionPath),
			action => _.assign({}, action, { returnType: 'Transaction' })
		);
	}

	function getRepository(/* domain , args */) {
		return {}; // TODO: extract from domain
	}

	function getTypeDefs(args) {
		const { queries, methods, actions } = args || {};
		const defaultQueries = {
			transact: {
				returnType: 'Transaction',
				params: {
					options: 'TransactOptions'
				}
			}
		};

		const defaultMethods = {
			version: {
				returnType: 'Int'
			}
		};

		const defaultActions = {
			id: {
				returnType: 'ID'
			},
			commit: {
				returnType: 'Result',
				params: {
					options: 'CommitOptions'
				}
			}
		};

		const typeDefQuery = getTypeDef('Query', _.assign(defaultQueries, queries));
		const typeDefAggregate = getTypeDef('Aggregate', _.assign(defaultMethods, methods));
		const typeDefTransaction = getTypeDef('Transaction', _.assign(defaultActions, actions));

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

		const queryDefs = _.reduce(queries || {}, (result, query, name) => {
			const params = getQueryParams(_.get(query, 'params'));
			const returnType = _.get(query, 'returnType');
			const prevResult = result && `${result}${LF}`;

			return returnType
				? `${prevResult}${name}${params}: ${returnType}`
				: result;
		}, '');

		return queryDefs;
	}

	function getQueryParams(params) {

		const queryParams = _.reduce(params, (result, type, name) => {
			const prevResult = result && (`${result}, `);

			return type ? `${prevResult}${name}:${type}` : result;
		}, '');

		return queryParams ? `(${queryParams})` : '';
	}

	function getResolvers(typeDefsRaw) {
		const { actions, repository } = typeDefsRaw;

		return {
			Query: _.assign({
				transact: getTransaction({ repository })
			}, getQueryResolvers()),
			Aggregate: getMethodResolvers(),
			Result: getResultResolvers(),
			Transaction: _.assign({
				commit
			}, getTransactionResolvers({ actions }))
		};
	}

	function getTransaction(options) {
		const { repository } = options || {};

		return (obj, args, rawCtxt) => {
			const id = uuidv4();

			const ctxt = getFilteredImmutableCtxt(rawCtxt);

			return Promise.resolve(Map({
				id,
				repository,
				ctxt,
				tasks: List([])
			}));
		};
	}

	function getFilteredImmutableCtxt(ctxt) {
		return toImmutable(_.pick(ctxt, [
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
	}

	function commit(obj) {
		const result = Map({
			id: obj.get('id'),
			success: true // TODO: replace with actual value for success
		});


		return Promise.resolve(result);
	}

	function getQueryResolvers() {
		return {
			load: () => [{ version: 1 }, { version: 2 }] // TODO: replace with actual resolver
		};
	}

	function getMethodResolvers() {
		return {
			version: obj => Promise.resolve(_.get(obj, 'version') || 0)
		};
	}

	function getResultResolvers() {
		return {
			id: obj => Promise.resolve(obj.get('id')),
			success: obj => Promise.resolve(obj.get('success'))
		};
	}

	function getTransactionResolvers(options) {
		const { actions } = options || {};

		return _.mapValues(actions, (action, name) => ((obj, args) => {
			const tasks = obj.get('tasks');
			const task = Map({
				name,
				args: toImmutable(args)
			});

			return obj.set('tasks', tasks.push(task));
		}));
	}

	return plugin;
});
