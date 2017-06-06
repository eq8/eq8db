'use strict';

module.exports = function createServer({ logger }) {
	return {
		listen(port) {
			logger.info(`listening on port ${port}`);
		}
	};
};
