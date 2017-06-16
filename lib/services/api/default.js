'use strict';

const { success } = require('./results.js');

module.exports = function loadApi({ logger }) {
	return function defaultHandler({ obj, args, ctxt }, done) {
		logger.info('defaultHandler', JSON.stringify(obj));

		done(null, success);
	};
};
