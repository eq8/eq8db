/* global define, Promise */
'use strict';

define([
	'lodash',
	'semver',
	'immutable',
	'-/logger/index.js',
	'-/api/domain/errors.js'
], (_, semver, { Map }, logger, ERRORS) => (result, args) => new Promise((resolve, reject) => {
	const { repository, entity, attributes } = args || {};

	if (!repository || !entity || !attributes) {
		return reject(new Error(ERRORS.INSUFFICIENT_ARGUMENTS));
	}

	// TODO: validate attributes
	// 	type

	const repositories = result
		.get('repositories') || Map({});
	const selectedRepository = repositories
		.get(repository) || Map({});
	const entities = selectedRepository
		.get('entities') || Map({});
	const selectedEntity = entities
		.get(entity) || Map({});
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

	const latestVersion = selectedEntity
		.get('versions')
		.get(shortLatest) || Map({});
	const newVersion = latestVersion.mergeDeep(Map({
		attributes: Map(attributes).map(v => (_.isObject(v) ? Map(v) : v))
	}));

	// TODO: only increment minor if there is a new attributes - i.e. vs. patching

	const changes = Map({
		repositories: Map({}).set(repository, Map({
			entities: Map({}).set(entity, Map({
				versions: Map({}).set(shortNewVersion, newVersion),
				tags: Map({ latest: newVersionTag })
			}))
		}))
	});

	return resolve(result.mergeDeep(changes));
}));
