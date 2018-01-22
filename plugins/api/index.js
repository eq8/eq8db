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

	function toImmutable(value) {
		if (_.isObject(value)) {
			return Map(_.mapValues(value, v => toImmutable(v)));
		}

		return value;
	}

	store.connect(settings, err => {
		if (err) {
			logger.error(err);

			return done(err);
		}

		return done(null, {
			domain: ({ id }) => {
				const domain = new Domain();

				if (!id) {
					domain.emit('reject', new Error('Domain identifier was not provided'));
				}

				store.read({ type: 'domain', id }, (readError, result) => {
					if (readError) {
						return domain.emit('reject', readError);
					}

					return domain.emit('resolve', toImmutable(result || { id }));
				});

				return domain;
			}
		});
	});
});
