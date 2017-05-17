'use strict';

module.exports = function proc({ logger }) {
	return function manage(options) {
		logger.info('manage:', options);
	};
};
