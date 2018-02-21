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

	rjs.config({ map });

	rjs([
		'-/logger/index.js',
		'-/api/index.js',
		'-/server/index.js'
	], (logger, api, server) => {
		done(null, {
			version,
			logger,
			api,
			server
		});
	});
};
