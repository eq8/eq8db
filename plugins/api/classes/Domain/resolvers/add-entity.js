/* global define, Promise */
'use strict';

define([
	'lodash',
	'immutable',
	'-/api/classes/domain/errors.js'
], (_, { Map }, ERRORS) => (result, args) => new Promise((resolve, reject) => {
	const { repository, name } = args || {};

	if (!repository || !name) {
		return reject(ERRORS.INSUFFICIENT_ARGUMENTS);
	}

	const repositories = result
		.get('repositories') || Map({});
	const selectedRepository = repositories
		.get(repository) || Map({});
	const entities = selectedRepository
		.get('entities') || Map({});

	if (entities.get(name)) {
		return reject(ERRORS.ENTITY_ALREADY_EXISTS);
	}

	const initialEntityState = Map({
		tags: Map({
			latest: '0.0.0',
			stable: '0.0.0'
		}),
		versions: Map({
			'0.0': Map({
				attributes: Map({
					id: Map({ type: 'String' }),
					version: Map({ type: 'Int' })
				})
			})
		})
	});

	const changes = result
		.set('repositories', Map({}).set(repository, Map({})
			.set('entities', Map({}).set(name, initialEntityState))));

	return resolve(result.mergeDeep(changes));
}));
