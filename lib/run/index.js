'use strict';

module.exports = function createRunInstance({ _, logger }) {
	return function run(options) {
		const settings = _.defaultsDeep(options, {
			port: 8000
		});

		logger.info('run:', settings);

		const server = require('./server.js')({
			logger
		});

		server.listen(settings.port);
	};
};
