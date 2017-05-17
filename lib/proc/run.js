'use strict';

module.exports = function proc(logger) {
	return function run(options) {
		logger.info('run:', options.toJSON());
	};
};
