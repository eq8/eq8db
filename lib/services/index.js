'use strict';

module.exports = function initServicesLoader(commons) {
	const { logger, seneca } = commons;

	logger.debug('initServicesLoader');

	return function servicesLoader({ action, docker, apiPath, port }, done) {
		seneca.use(require('./log.js')(commons));

		switch(action) {
			case 'listen':
				seneca.use(require('./api')(commons));
				require('./graphql')(commons);
				seneca.use(require('./server.js')(commons), { apiPath, port });
				break;
			case 'start':
				seneca.use(require('./processor.js')(commons));
				break;
			case 'deploy':
			case 'teardown':
				seneca.use(require('./orchestrator')(commons), { docker, port });
				break;
		}

		seneca.use(require('./app.js'));

		done(seneca);
	};
};
