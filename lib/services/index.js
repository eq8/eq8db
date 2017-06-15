'use strict';

module.exports = function initServices(commons) {
	const { logger } = commons;

	logger.debug('initServices');

	return {
		server: require('./server.js')(commons),
		log: require('./log.js')(commons),
		api: require('./api')(commons),
		graphql: require('./graphql')(commons)
	};
};
