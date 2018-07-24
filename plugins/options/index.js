
/* global define */
'use strict';

const optionsWhitelist = [
	'storeUri', 'port', 'retryInterval', 'overridesFile'
];

define([
	'lodash'
], _ => {

	let settings = {};

	function init(options) {

		// Provide defaults
		settings = _.defaultsDeep(_.pick(options, optionsWhitelist), {
			port: 8000,
			retryInterval: 1000
		});

		return get();
	}

	function get(path) {
		return path
			? _.get(settings, path)
			: _.cloneDeep(settings);
	}

	return {
		init, get
	};
});
