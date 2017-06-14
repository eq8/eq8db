'use strict';

const { success } = require('./results.js');

module.exports = function loadApi({ logger }) {
	return function addCluster(args, done) {
		logger.debug('addCluster:', args);

		done(null, success);
	};
};
