'use strict';

const plugin = 'server';

const _ = require('lodash');
const app = require('express')();

module.exports = function createServer({ logger }) {
	logger.debug('createServer');

	return function server(options) {
		const services = this;

		const settings = _.defaultsDeep(options, {
			apiPath: 'api'
		});

		logger.info('server:', settings);

		const { apiPath } = settings;

		app.use(`/:db/${apiPath}/:v`, (req, res, next) => {
			const db = _.get(req, 'params.db');
			const v = _.get(req, 'params.v');

			services.act({
				plugin: 'graphql', q: 'middleware', db, v
			}, (err, { middleware }) => {
				if (err) {
					logger.error(err);
				}

				middleware(req, res, next);
			});
		});

		services.add({ plugin, cmd: 'start' }, (args, done) => {
			app.listen(settings.port, done);
		});
	};
};
