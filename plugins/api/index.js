/* global define */
'use strict';

/**
 * The API plugin exposes an API for defining domains and its respective API
 * - i.e. dynamic API definition
 */
define([
	'lodash',
	'-/logger/index.js',
	'-/api/classes/domain/index.js'
], (
	_,
	logger,
	Domain
) => function pluginAPI(options, done) {

	function domain(params) {
		return Domain.chain(params);
	}

	done(null, { domain });
});
