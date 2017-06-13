'use strict';

module.exports = function loadServices(commons) {
	const { logger } = commons;

	logger.debug('loadServices');

	return {
		server: require('./server.js')(commons),
		log: require('./log.js')(commons),
		api: require('./api')(commons),
		graphql: require('./graphql')(commons)
	};
};
