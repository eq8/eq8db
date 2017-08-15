/* globals Promise */

'use strict';

const _ = require('lodash');
const { Map } = require('immutable');

const RESULT_OK = {
	code: 200,
	description: 'ok'
};

module.exports = function resolvers(services, host) {
	return {
		Query: {
			domain: getDomain(services, host)
		},
		Transaction: {
			addAggregate: getResolver((resolve, reject, obj, args) => {
				const { name } = args;

				obj = obj.set('aggregates', obj.get('aggregates').set(name, Map({})));

				resolve(obj);
			}),
			addEntity: getResolver((resolve, reject, obj, args) => {
				const { name } = args;
				const changes = Map({})
					.set('entities', Map({})
						.set(name, Map({})
							.set('attributes', Map({}))
						)
					);

				resolve(obj.mergeDeep(changes));
			}),
			addAttribute: getResolver((resolve, reject, obj, args) => {
				const { entity, name, value, isCollection } = args;
				const changes = Map({})
					.set('entities', Map({})
						.set(entity, Map({})
							.set('attributes', Map({})
								.set(name, Map({ value, isCollection }))
							)
						)
					);

				resolve(obj.mergeDeep(changes));
			}),
			addQuery: getResolver((resolve, reject, obj, args) => {
				const { aggregate, name, value, isCollection } = args;
				const changes = Map({})
					.set('aggregates', Map({})
						.set(aggregate, Map({})
							.set('queries', Map({})
								.set(name, Map({ value, isCollection })
									.set('arguments', Map({}))
								)
							)
						)
					);

				resolve(obj.mergeDeep(changes));
			}),
			addMutation: getResolver((resolve, reject, obj, args) => {
				const { aggregate, name } = args;
				const changes = Map({})
					.set('aggregates', Map({})
						.set(aggregate, Map({})
							.set('mutations', Map({})
								.set(name, Map({})
									.set('arguments', Map({}))
								)
							)
						)
					);

				resolve(obj.mergeDeep(changes));
			}),
			commit: getResolver((resolve, reject, obj) => {
				obj = obj.set('version', obj.get('version') + 1);

				const params = {
					type: 'domains',
					object: obj.toJSON()
				};

				services.act({ plugin: 'store', cmd: 'edit', params }, (err, result) => {
					if (err) {
						reject(err);
					} else {
						if (result.errors) {
							reject(result.first_error);
						} else {
							resolve(RESULT_OK);
						}
					}
				});
			})
		},
		Mutation: {
			transact: getDomain(services, host)
		}
	};
};

function getDomain(services, host) {
	return getResolver((resolve, reject) => {
		const id = host; // TODO: add default host
		const params = {
			type: 'domains',
			id
		};

		services.act({ plugin: 'store', q: 'read', params }, (err, result) => {
			if (result) {
				const { version, aggregates, entities } = result;

				if (err) {
					reject(err);
				} else {
					resolve(
						Map({
							id,
							version,
							aggregates: toImmutable(aggregates),
							entities: toImmutable(entities)
						})
					);
				}
			} else {
				resolve(
					Map({
						id,
						version: 0,
						aggregates: Map({}),
						entities: Map({})
					})
				);
			}
		});
	});
}

function toImmutable(value) {
	if (_.isObject(value)) {
		return Map(_.mapValues(value, v => toImmutable(v)));
	}

	return value;
}

function getResolver(resolver) {
	return (obj, args, ctxt) => new Promise((resolve, reject) => {
		try {
			resolver(resolve, reject, obj, args, ctxt);
		} catch (err) {
			reject(err);
		}
	});
}
