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
		getEntities,
		getRepository,
		getTypeDefs,
		getResolvers
	};

	const LF = '\n';
	const PROPERTIES = {
		QUERIES: 'queries',
		METHODS: 'methods',
		ACTIONS: 'actions',
		ENTITIES: 'entities',
		REPOSITORY: 'repository'
	};

	function getQueries(domain, args) {
		const queries = getAggregatePropertyValue(domain, args, PROPERTIES.QUERIES) || {};

		return _.mapValues(
			queries,
			query => _.assign({}, query, { returnType: { name: 'Aggregate', isCollection: true } })
		);
	}

	function getMethods(domain, args) {
		const methods = getAggregatePropertyValue(domain, args, PROPERTIES.METHODS) || {};
		const hasReturnType = _.partialRight(_.has, 'returnType');

		return _.pickBy(methods, hasReturnType);
	}

	function getActions(domain, args) {
		const actions = getAggregatePropertyValue(domain, args, PROPERTIES.ACTIONS) || {};

		return _.mapValues(
			actions,
			action => _.assign({}, action, { returnType: { name: 'Transaction' } })
		);
	}

	function getEntities(domain, args) {
		const entities = getAggregatePropertyValue(domain, args, PROPERTIES.ENTITIES) || {};

		// const hasName = _.partialRight(_.has, 'methods');

		return entities; // _.pickBy(entities, hasName);
	}

	function getRepository(domain, args) {
		const repositoryName = getAggregatePropertyValue(domain, args, PROPERTIES.REPOSITORY);
		const repositoryPath = `repositories[${repositoryName}]`;
		const repository = _.get(domain, repositoryPath);

		return repository;
	}

	function getAggregatePropertyValue(domain, args, propertyName) {
		const { bctxt, aggregate, v } = args || {};
		const propertyPath = `boundedContexts[${bctxt}].aggregates[${aggregate}].versions[${v}][${propertyName}]`;
		const propertyValue = _.get(domain, propertyPath);

		return propertyValue;
	}

	function getTypeDefs(args) {
		const { queries, methods, actions, entities } = args || {};
		const defaultQueries = {
			transact: {
				returnType: { name: 'Transaction' },
				params: {
					options: 'TransactOptions'
				}
			}
		};

		const defaultMethods = {
			id: {
				returnType: { name: 'ID' }
			},
			version: {
				returnType: { name: 'Int' }
			}
		};

		const defaultActions = {
			id: {
				returnType: { name: 'ID' }
			},
			commit: {
				returnType: { name: 'Result' },
				params: {
					options: 'CommitOptions'
				}
			}
		};

		const defaultEntities = {
			Query: {
				methods: _.assign({}, queries, defaultQueries)
			},
			Aggregate: {
				methods: _.assign({}, methods, defaultMethods)
			},
			Transaction: {
				methods: _.assign({}, actions, defaultActions)
			},
			Result: {
				methods: {
					id: {
						returnType: {
							name: 'ID!'
						}
					},
					success: {
						returnType: {
							name: 'Boolean'
						}
					}
				}
			}
		};


		const typeDefEntities = _.reduce(_.assign({}, entities, defaultEntities), (result, entity, name) => {
			const entityMethods = _.get(entity, 'methods') || {};
			const typeDefEntity = getTypeDef(name, entityMethods);

			return `${result}${typeDefEntity}${LF}`;
		}, '');

		const typeDef = `
"""
Sample documentation for Aggregate
"""
${typeDefEntities}

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
			const returnTypeName = _.get(query, 'returnType.name');
			const returnTypeIsCollection = _.get(query, 'returnType.isCollection');
			const returnType = returnTypeIsCollection
				? `[${returnTypeName}]`
				: returnTypeName;
			const prevResult = result && `${result}${LF}`;

			return returnType
				? `${prevResult} ${name}${params}: ${returnType}`
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
			Query: _.assign({}, getQueryResolvers(), {
				transact: getTransaction({ repository })
			}),
			Aggregate: getMethodResolvers(),
			Result: getResultResolvers(),
			Transaction: _.assign({}, getTransactionResolvers({ actions }), {
				commit
			})
		};
	}

	function getTransaction(options) {
		const { repository } = options || {};

		return (obj, args, rawCtxt) => {
			const id = uuidv4();

			const ctxt = getFilteredImmutableCtxt(rawCtxt);

			return Promise.resolve(Map({
				id,
				repository: Map(repository),
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
			load: () => [{
				id: 'localhost:8000',
				version: 1,
				repository: {
					name: 'default'
				}
			}] // TODO: replace with actual resolver
		};
	}

	function getMethodResolvers() {
		return {
			id: obj => Promise.resolve(_.get(obj, 'id') || 0),
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
