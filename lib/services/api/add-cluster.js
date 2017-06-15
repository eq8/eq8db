'use strict';

const { success } = require('./results.js');

module.exports = function loadApi({ logger }) {
	return function addCluster({ obj, args, ctxt }, done) {
		logger.debug('addCluster', obj);

		done(null, success);
	};
};
