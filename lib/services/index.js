'use strict';

module.exports = function initServicesLoader(commons) {
	const { logger, framework } = commons;

	logger.debug('initServicesLoader');

	return function servicesLoader({ action, docker, apiPath, port, store, dev }, done) {
		switch (action) {
		case 'deploy':
		case 'teardown':
			framework.use(require('./orchestrator')(commons), { docker, port, dev });
			break;
		case 'process':
			framework.use(require('./processor.js')(commons));
			break;
		case 'serve':
		default:
			framework.use(require('./store')(commons), { store });
			framework.use(require('./graphql/admin')(commons));
			framework.use(require('./graphql/db')(commons));
			framework.use(require('./server.js')(commons), { apiPath, port });
			break;
		}

		done(framework);
	};
};
