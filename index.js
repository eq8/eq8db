'use strict';

const _ = require('lodash');
const path = require('path');
const rjs = require('requirejs');

const { version } = require('./package.json');

module.exports = function mvp(options, done) {

	const settings = _.defaultsDeep(options, {});

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

	rjs([
		'-/logger/index.js',
		'-/store/index.js',
		'-/api/index.js',
		'-/server/index.js'
	], (logger, store, api, server) => {
		done(null, {
			version,
			logger,
			store,
			api,
			server
		});
	});
};
