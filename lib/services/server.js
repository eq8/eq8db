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

		app.use(`/:aggregate/${apiPath}/:v`, (req, res, next) => {
			const aggregate = _.get(req, 'params.aggregate');
			const v = _.get(req, 'params.v');

			services.act({
				plugin: 'graphql', q: 'middleware', aggregate, v
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
