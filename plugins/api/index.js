/* global define */
'use strict';

define([
	'lodash',
	'-/logger/index.js',
	'-/store/index.js',
	'-/utils/index.js',
	'-/api/classes/Domain/index.js'
], (_, logger, store, { toImmutable }, Domain) => function pluginAPI(options, done) {
	const settings = _.pick(options, ['store']);
	const retryInterval = parseInt(process.env.MVP_STORE_RETRY_INTERVAL, 10) || 1000;
	let retryTimerId;

	connect(done);

	function connect(callback) {
		store
			.connect(settings)
			.then(() => {
				if (retryTimerId) {
					clearTimeout(retryTimerId);
				}

				callback(null, { domain });
			}, err => {
				logger.error(err);
				retryTimerId = setTimeout(connect, retryInterval, callback);
			});
	}

	function domain(params) {
		const handler = handlerWithContext(params);

		return new Domain(handler);
	}

	function handlerWithContext(params) {
		const { id } = params || {};

		return (resolve, reject) => {
			if (!id) {
				reject(new Error('Domain identifier was not provided'));
			}

			const onRead = onReadWithCtxt({ id, resolve });

			store.read({ type: 'domain', id }).then(onRead, reject);
		};
	}

	function onReadWithCtxt({ id, resolve }) {
		return result => {
			const immutableResult = toImmutable(result || {
				id,
				version: 0,
				repositories: {
					default: {
						type: 'memory',
						entities: {}
					}
				}
			});

			return resolve(immutableResult);
		};
	}

});
