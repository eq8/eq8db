'use strict';

module.exports = function loadServices(commons) {
	return {
		server: require('./server.js')(commons),
		log: require('./log.js')(commons),
		graphql: require('./graphql.js')(commons)
	};
};
