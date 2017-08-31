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

module.exports = function server(options) {
	const services = this;

	services.log.info('server', options);

	app.use('/:bctxt/:v', (req, res, next) => {
		const host = _.get(req, 'headers.host');
		const bctxt = _.get(req, 'params.bctxt');
		const v = _.get(req, 'params.v');

		const uri = `${host}/${bctxt}/${v}`;

		const cached = cache.get(uri);

		if (cached) {
			cached(req, res, next);
		} else {
			services.act({
				plugin: 'graphql', q: 'middleware', host, bctxt, v
			}, (err, { middleware }) => {
				if (err) {
					services.log.error(err);
				}

				cache.set(uri, middleware);
				middleware(req, res, next);
			});
		}

	});

	services.add({ plugin, cmd: 'start' }, (args, done) => {
		services.log.info('server#start');

		app.listen(options.port, done);
	});
};
