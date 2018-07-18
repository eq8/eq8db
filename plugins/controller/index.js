/* globals define */
'use strict';

define([
	'lodash',
	'lru-cache',
	'-/logger/index.js',
	'-/controller/lib/index.js'
], (_, lru, logger, utils) => {
	const LRU_MAXSIZE = !_.isNaN(parseInt(process.env.MVP_SERVER_LRU_MAXSIZE, 10))
		? parseInt(process.env.MVP_SERVER_LRU_MAXSIZE, 10)
		: 500;
	const LRU_MAXAGE = !_.isNaN(parseInt(process.env.MVP_SERVER_LRU_MAXAGE, 10))
		? parseInt(process.env.MVP_SERVER_LRU_MAXAGE, 10)
		: 1000 * 60 * 60;
	const cache = lru({
		max: LRU_MAXSIZE,
		length: (n, key) => n * 2 + key.length,
		dispose: (key, n) => n.close(),
		maxAge: LRU_MAXAGE
	});

	const {
		getInterface
	} = utils;

	const plugin = {
		middleware() {
			return (req, res, next) => {
				const domain = _.get(req, 'headers.host');
				const bctxt = _.get(req, 'params.bctxt');
				const aggregate = _.get(req, 'params.aggregate');
				const v = _.get(req, 'params.v');

				const uri = `${domain}/${bctxt}/${aggregate}/${v}`;

				logger.debug('uri', { uri });

				const cached = cache.get(uri);

				if (cached) {
					logger.trace(`using cached middleware for ${uri}`);

					cached(req, res, next);
				} else {
					logger.trace(`loading middleware for ${uri}`);

					getInterface({
						domain, bctxt, aggregate, v
					}).then(middleware => {
						logger.trace('middleware found');
						cache.set(uri, middleware);
						middleware(req, res, next);
					}, next);
				}
			};
		}
	};

	return plugin;
});

