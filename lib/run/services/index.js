'use strict';

module.exports = function loadServices(commons) {
	const { logger } = commons;

	logger.debug('loadServices');

	return {
		server: require('./server.js')(commons),
		log: require('./log.js')(commons),
		graphql: require('./graphql/index.js')(commons)
	};
};
