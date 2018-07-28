/* global define */
'use strict';

define([
	'lodash',
	'yargs'
], (_, { argv }) => {

	let settings = argv;

	function init(options, defaults) {

		// Provide defaults
		settings = _.defaultsDeep(options, defaults);

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
