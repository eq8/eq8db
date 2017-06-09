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

		app.use(`${apiPath}/:db`, (req, res, next) => {
			const db = _.get(req, 'params.db');

			seneca.act({
				plugin: 'graphql', cmd: 'subscribe', type: 'updates', db
			}, (err, { middleware }) => {
				if (err) {
					logger.error(err);
				}

				middleware(req, res);
				next();
			});
		});

		seneca.add({ plugin, cmd: 'listen' }, (args, done) => {
			app.listen(args.port, done);
		});
	};
};