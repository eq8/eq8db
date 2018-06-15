/* global define, Promise */
'use strict';

define([
	'immutable'
], ({ Map }) => (result, args) => new Promise(resolve => {
	const { name } = args || {};
	const boundedContexts = result.get('boundedContexts') || Map({});
	const resolved = result
		.set(
			'boundedContexts',
			boundedContexts.set(name, Map({}))
		);

	resolve(resolved);
}));
