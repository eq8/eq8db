/* global Promise */
'use strict';

const _ = require('lodash');
const path = require('path');
const rjs = require('requirejs');

const { version } = require('./package.json');

module.exports = function mvp(argv) {

	const settings = _.defaultsDeep(argv, {});

	const { overrides } = settings;

	const mapOverrides = overrides
		? overrides
		: {};

	const map = _.defaultsDeep({}, mapOverrides, {
		'*': {
			'-': path.join(__dirname, './plugins')
		}
	});

	// Leverage AMD for the plugin architecture
	// We'll be using the `overrides` to re-map the implementation of internal dependencies
	rjs.config({ map });

	return new Promise(resolve => {
		rjs([
			'-/options/index.js',
			'-/logger/index.js',
			'-/store/index.js',
			'-/server/index.js'
		], (options, logger, store, server) => {
			resolve({
				version,
				options,
				logger,
				store,
				server
			});
		});
	});
};
