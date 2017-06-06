'use strict';

module.exports = function createRunInstance(commons) {
	const createServer = require('./server.js')(commons);

	return function run(options) {
		const { _, logger } = commons;
		const settings = _.defaultsDeep(options, {
			port: 8000
		});

		logger.info('run:', settings);

		const { apiPath, port } = settings;
		const server = createServer({ apiPath });

		server.listen(port);
	};
};
