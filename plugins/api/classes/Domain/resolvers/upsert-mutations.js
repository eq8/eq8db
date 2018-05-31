/* global define, Promise */
'use strict';

define([
	'lodash',
	'semver',
	'immutable',
	'-/logger/index.js',
	'-/api/classes/domain/errors.js'
], (_, semver, { Map }, logger, ERRORS) => (result, args) => new Promise((resolve, reject) => {
	const { bctxt, aggregate, mutations } = args || {};

	if (!bctxt || !aggregate || !mutations) {
		return reject(new Error(ERRORS.INSUFFICIENT_ARGUMENTS));
	}

	// TODO: validate mutations
	// parameters
	// 	name
	// 	isCollection

	const boundedContexts = result
		.get('boundedContexts') || Map({});
	const selectedBoundedContext = boundedContexts
		.get(bctxt) || Map({});
	const aggregates = selectedBoundedContext
		.get('aggregates') || Map({});
	const selectedAggregate = aggregates
		.get(aggregate) || Map({});
	const tags = result
		.get('tags') || Map({});
	const latestTag = tags
		.get('latest') || '0.0.0';

	const majorLatest = semver.major(latestTag);
	const minorLatest = semver.minor(latestTag);
	const shortLatest = `${majorLatest}.${minorLatest}`;

	const newVersionTag = semver.inc(latestTag, 'minor');
	const minorNewVersion = semver.minor(newVersionTag);
	const shortNewVersion = `${majorLatest}.${minorNewVersion}`;

	const latestVersion = selectedAggregate
		.get('versions')
		.get(shortLatest) || Map({});
	const newVersion = latestVersion.mergeDeep(Map({
		mutations: Map(mutations).map(v => (_.isObject(v) ? Map(v) : v))
	}));

	// TODO: only increment minor if there is a new query - i.e. vs. patching

	const changes = Map({
		boundedContexts: Map({}).set(bctxt, Map({
			aggregates: Map({}).set(aggregate, Map({
				versions: Map({}).set(shortNewVersion, newVersion),
				tags: Map({ latest: newVersionTag })
			}))
		}))
	});

	return resolve(result.mergeDeep(changes));
}));
