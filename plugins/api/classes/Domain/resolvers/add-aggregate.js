/* global define, Promise */
'use strict';

define([
	'lodash',
	'immutable',
	'-/api/classes/Domain/errors.js'
], (_, { Map }, ERRORS) => (result, args) => new Promise((resolve, reject) => {
	const { bctxt, name } = args || {};

	if (!bctxt || !name) {
		return reject(ERRORS.INSUFFICIENT_ARGUMENTS);
	}

	const { repository, rootEntity } = _.defaultsDeep(args, {
		repository: 'default',
		rootEntity: name
	});

	/*
	 * TODO
	 * - check name is valid
	 * - check bctxt, repository, rootEntity is valid
	 */
	const boundedContexts = result
		.get('boundedContexts') || Map({});
	const selectedBoundedContext = boundedContexts
		.get(bctxt) || Map({});
	const aggregates = selectedBoundedContext
		.get('aggregates') || Map({});

	if (aggregates.get(name)) {
		return reject(ERRORS.AGGREGATE_ALREADY_EXISTS);
	}

	const initialAggregateState = Map({
		tags: Map({
			latest: '0.0',
			stable: '0.0'
		}),
		'0.0': Map({
			repository,
			rootEntity,
			queries: Map({}),
			mutations: Map({})
		})
	});
	const withNewAggregate = aggregates
		.set(name, Map(initialAggregateState));
	const resolved = result
		.set('boundedContexts', boundedContexts.set(bctxt, Map({ aggregates: withNewAggregate })));

	return resolve(resolved);
}));
