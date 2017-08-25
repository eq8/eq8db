/* globals Promise */

'use strict';

const { Map } = require('immutable');

module.exports = function resolvers(services, host) {
	return {
		Query: {
			domain: readDomain(services, host)
		},
		Transaction: {
			addBoundaryContext: getResolver((resolve, reject, obj, args) => {
				const { name } = args;

				obj = obj.set('aggregates', obj.get('boundaryContexts').set(name, Map({})));

				resolve(obj);
			}),
			addAggregate: getResolver((resolve, reject, obj, args) => {
				const { boundaryContext, name } = args;
				const changes = Map({})
					.set('boundaryContexts', Map({})
						.set(boundaryContext, Map({})
							.set('aggregates', Map({})
								.set(name, Map({}))
							)
						)
					);

				resolve(obj.mergeDeep(changes));
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
				const { boundaryContext, aggregate, name, value, isCollection } = args;
				const changes = Map({})
					.set('boundaryContexts', Map({})
						.set(boundaryContext, Map({})
							.set('aggregates', Map({})
								.set(aggregate, Map({})
									.set('queries', Map({})
										.set(name, Map({ value, isCollection })
											.set('arguments', Map({}))
										)
									)
								)
							)
						)
					);

				resolve(obj.mergeDeep(changes));
			}),
			addMutation: getResolver((resolve, reject, obj, args) => {
				const { boundaryContext, aggregate, name } = args;
				const changes = Map({})
					.set('boundaryContexts', Map({})
						.set(boundaryContext, Map({})
							.set('aggregates', Map({})
								.set(aggregate, Map({})
									.set('mutations', Map({})
										.set(name, Map({})
											.set('arguments', Map({}))
										)
									)
								)
							)
						)
					);

				resolve(obj.mergeDeep(changes));
			}),
			commit: editDomain(services)
		},
		Mutation: {
			transact: readDomain(services, host)
		}
	};
};

function readDomain(services, host) {
	return getResolver((resolve, reject) => {
		services.act({ plugin: 'api', q: 'readDomain', host }, (err, domain) => {
			if (err) {
				reject(err);
			} else {
				resolve(domain);
			}
		});
	});
}

function editDomain(services) {
	return getResolver((resolve, reject, obj) => {
		services.act({ plugin: 'api', cmd: 'editDomain', domain: obj }, (err, result) => {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		});
	});
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
