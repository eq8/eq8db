/* global define */
'use strict';

define([
	'lodash',
	'express',
	'lru-cache',
	'-/logger/index.js',
	'-/graphql/index.js'
], (_, express, lru, logger, pluginGraphQL) => {
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

	const app = express();

	return {
		listen: function server(options, done) {
			const { port } = _.defaultsDeep(options, {
				port: 8000
			});

			app.use('/:bctxt/:aggregate/:v', (req, res, next) => {
				const domain = _.get(req, 'headers.host');
				const bctxt = _.get(req, 'params.bctxt');
				const aggregate = _.get(req, 'params.aggregate');
				const v = _.get(req, 'params.v');

				const uri = `${domain}/${bctxt}/${aggregate}/${v}`;

				logger.debug('uri', uri);

				const cached = cache.get(uri);


				if (cached) {
					logger.trace(`using cached middleware for ${uri}`);

					cached(req, res, next);
				} else {
					logger.trace(`loading middleware for ${uri}`);

					pluginGraphQL.middleware({
						domain, bctxt, aggregate, v
					}, (err, { middleware }) => {
						if (err) {
							return logger.error(err);
						}

						cache.set(uri, middleware);
						return middleware(req, res, next);
					});
				}

			});

			app.listen(port, done);
		}
	};
});
