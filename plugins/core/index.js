/* globals define */
'use strict';

define([
	'lodash',
	'url-parse',
	'request',
	'-/logger/index.js',
	'-/store/index.js'
], (_, urlParse, request, logger, store) => {
	const plugin = {
		middleware() {
			return middleware;
		}
	};

	function middleware(req, res, next) {
		hasView({ req, res })
			.then(
				noNext => noNext || next(),
				() => next(new Error('core unable to check if request has a view'))
			);
	}

	async function hasView(args) {
		const { req, res } = args;
		const id = _.get(req, 'headers.host');

		const { originalUrl } = req || {};
		const url = urlParse(originalUrl);
		const { pathname } = url || { pathname: '/' };

		const domainConfig = await getDomainConfig({ id });

		logger.trace(`reading route info for ${pathname}`);

		const routeConfig = _.get(domainConfig, `routes['${pathname}']`);
		const { view } = routeConfig || {};

		logger.debug('route config', { config: routeConfig });

		if (view) {
			req.pipe(request(view, {
				headers: {
					host: _.get(req, 'headers.host')
				}
			})).pipe(res);
		}

		return !!routeConfig;
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

