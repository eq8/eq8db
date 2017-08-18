'use strict';

const plugin = 'server';

const _ = require('lodash');
const app = require('express')();
const lru = require('lru-cache');

const LRU_MAXSIZE = !_.isNaN(parseInt(process.env.LRU_MAXSIZE, 10))
	? parseInt(process.env.LRU_MAXSIZE, 10)
	: 500;
const LRU_MAXAGE = !_.isNaN(parseInt(process.env.LRU_MAXAGE, 10))
	? parseInt(process.env.LRU_MAXAGE, 10)
	: 1000 * 60 * 60;
const cache = lru({
	max: LRU_MAXSIZE,
	length: (n, key) => n * 2 + key.length,
	dispose: (key, n) => n.close(),
	maxAge: LRU_MAXAGE
});

module.exports = function createServer({ logger }) {
	logger.debug('createServer', __filename);

	return function server(options) {
		const services = this;

		const settings = _.defaultsDeep(options, {
			apiPath: 'api'
		});

		logger.info('server', settings);

		const { apiPath } = settings;

		app.use(`/:aggregate/${apiPath}/:v`, (req, res, next) => {
			const host = _.get(req, 'headers.host');
			const aggregate = _.get(req, 'params.aggregate');
			const v = _.get(req, 'params.v');

			const uri = `${host}/${aggregate}/${v}`;

			const cached = cache.get(uri);

			if (cached) {
				cached(req, res, next);
			} else {
				services.act({
					plugin: 'graphql', q: 'middleware', aggregate, v, host
				}, (err, { middleware }) => {
					if (err) {
						logger.error(err);
					}

					cache.set(uri, middleware);
					middleware(req, res, next);
				});
			}

		});

		services.add({ plugin, cmd: 'start' }, (args, done) => {
			logger.info('server#start');

			app.listen(settings.port, done);
		});
	};
};
