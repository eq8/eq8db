/* globals define */
'use strict';

define([
	'lodash',
	'express',
	'request',
	'lru-cache',
	'-/logger/index.js',
	'-/store/index.js'
], (_, { Router }, request, lru, logger, store) => {
	const max = !_.isNaN(parseInt(process.env.MVP_CONTROLLER_LRU_MAXSIZE, 10))
		? parseInt(process.env.MVP_CONTROLLER_LRU_MAXSIZE, 10)
		: 500;
	const maxAge = !_.isNaN(parseInt(process.env.MVP_CONTROLLER_LRU_MAXAGE, 10))
		? parseInt(process.env.MVP_CONTROLLER_LRU_MAXAGE, 10)
		: 1000 * 60 * 60;
	const cache = lru({
		max,
		maxAge
	});

	const plugin = {
		middleware() {
			return middleware;
		}
	};

	function middleware(req, res, next) {
		reroute(req)
			.then(
				router => router(req, res, next),
				() => next(new Error('core unable to check if request has a view'))
			);
	}

	async function reroute(ctx) {
		const { headers } = ctx || {};
		const host = _.get(headers, 'host');

		const cached = cache.get(host);

		if (cached) {
			return cached;
		}

		const router = Router();

		const domain = await getDomainConfig({ id: host });

		logger.debug('domain config', { config: domain });

		const routes = _.get(domain, 'routes');

		// TODO: handle exception where route config does not match expected schema
		_.each(routes, route => {
			const { path, view, passthru } = route || {};

			logger.debug('route config', { config: route });

			if (view) {
				router.use(path, (req, res) => {
					const { url } = req || {};
					const requestUrl = passthru
						? `${view}${url}`
						: view;

					logger.debug('reroute', { url, requestUrl });

					req.pipe(request(requestUrl, {
						headers: {
							host
						}
					})).pipe(res);
				});
			}
		});

		cache.set(host, router);

		return router;
	}

	async function getDomainConfig(args) {
		const { id } = args || {};

		logger.trace(`reading domain info for ${id}`);

		const config = await store.read({
			type: 'domains',
			id
		});

		logger.debug('domain config', { config });

		return config;
	}

	return plugin;
});

