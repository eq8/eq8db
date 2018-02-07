/* global define */
'use strict';

define([
	'lodash',
	'immutable',
	'-/logger/index.js',
	'-/store/index.js',
	'-/api/classes/Domain/index.js'
], (_, { Map }, logger, store, Domain) => function(options, done) {
	const settings = _.pick(options, ['store']);

	store.connect(settings, err => {
		if (err) {
			logger.error(err);

			return done(err);
		}

		return done(null, { domain });
	});

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

			const onRead = onReadWithCtxt({ id, resolve, reject });

			store.read({ type: 'domain', id }, onRead);
		};
	}

	function onReadWithCtxt({ id, resolve, reject }) {
		return (readError, result) => {
			if (readError) {
				return reject(readError);
			}

			const immutableResult = toImmutable(result || {
				id,
				version: 0,
				repositories: {
					default: {
						type: 'memory'
					}
				}
			});

			return resolve(immutableResult);
		};
	}

	function toImmutable(value) {
		if (_.isObject(value)) {
			return Map(_.mapValues(value, v => toImmutable(v)));
		}

		return value;
	}
});
