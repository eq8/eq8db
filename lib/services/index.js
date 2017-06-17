'use strict';

module.exports = function initServicesLoader(commons) {
	const { logger, seneca } = commons;

	logger.debug('initServicesLoader');

	return function servicesLoader({ dev, worker, apiPath }, done) {
		if (!worker || dev) {
			seneca.use(require('./server.js')(commons), apiPath);
			seneca.use(require('./log.js')(commons));
			seneca.use(require('./api')(commons));
			require('./graphql')(commons);
		}

		done(null, seneca);
	};
};
