'use strict';

module.exports = function kernel(logger) {
	return {
		run: require('./proc/run.js')(logger)
	};
};
