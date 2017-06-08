'use strict';

const plugin = 'server';

const app = require('express')();

module.exports = function createServer({ _, logger }) {
	return function server(options) {
		const seneca = this;

		const settings = _.defaultsDeep(options, {
			apiPath: '/api'
		});

		logger.info('server:', settings);

		const { apiPath } = settings;

		app.use(apiPath, (req, res, next) => {
			const done = _.ary(next, 0);

			seneca.act({ plugin: 'graphql', cmd: 'request', req, res }, done);
		});

		seneca.add({ plugin, cmd: 'listen' }, (args, done) => {
			app.listen(args.port, done);
		});
	};
};
