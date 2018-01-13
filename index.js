'use strict';

const { version } = require('./package.json');

module.exports = function mvp() {

	// const settings = _.defaultsDeep(options, {});

	// const { host, store, logger } = settings;

	return {
		version: () => version
	};
};
