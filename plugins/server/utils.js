/* globals define */
'use strict';

define([
	'lodash',
	'-/logger/index.js',
	'-/store/index.js',
	'-/server/lib/error-handler.js'
], (_, logger, store, errorHandler) => {

	const plugin = {
		contextProvider() {
			return (req, res, next) => {
				const id = _.get(req, 'headers.host');

				getDomain({ id })
					.then(appContext => {
						_.defaults(req, { appContext });
						next();
					});
			};
		},
		errorHandler
	};

	async function getDomain(args) {
		const { id } = args || {};

		logger.trace(`reading domain info for ${id}`);

		const domain = await store.read({
			type: 'domains',
			id
		});

		logger.debug('domain', { domain });

		return domain;
	}

	return plugin;
});
