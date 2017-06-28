'use strict';

module.exports = function initServicesLoader(commons) {
	const { logger, seneca } = commons;

	logger.debug('initServicesLoader');

	return function servicesLoader({ action, docker, apiPath, port, store, dev }, done) {
		seneca.use(require('./log.js')(commons));

		switch (action) {
		case 'deploy':
		case 'teardown':
			seneca.use(require('./orchestrator')(commons), { docker, port, dev });
			break;
		case 'process':
			seneca.use(require('./processor.js')(commons));
			break;
		case 'serve':
		default:
			seneca.use(require('./api')(commons), { store });
			seneca.use(require('./graphql/admin')(commons));
			seneca.use(require('./graphql/db')(commons));
			seneca.use(require('./server.js')(commons), { apiPath, port });
			break;
		}

		done(seneca);
	};
};
