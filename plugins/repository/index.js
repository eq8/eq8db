/* globals define, Promise */
'use strict';

define([
	'lodash',
	'seneca',
	'seneca-entity',
	'-/logger/index.js'
], (_, seneca, senecaEntity, logger) => {
	const serviceLocator = seneca();

	serviceLocator.use(senecaEntity);

	return {
		connect: (config, { domain, aggregate, v }) => {
			const rootEntity = aggregate;
			const schemaVersion = v;

			const client = {
				load: args => new Promise((resolve, reject) => {
					const canon = `${domain}/${rootEntity}/${schemaVersion}`;
					const entity = serviceLocator.make$(canon);

					logger.trace('client load');
					entity.load$(args, (err, record) => {
						logger.trace('client load callback');
						if (err) {
							logger.error(err);
							return reject(err);
						}

						logger.trace('client load record', record);
						return resolve(record || {});
					});
				}),
				save: args => new Promise((resolve, reject) => {
					const canon = `${domain}/${rootEntity}/${schemaVersion}`;
					const entity = serviceLocator.make$(canon);

					logger.trace('save');
					entity.save$(args, (err, record) => {
						if (err) {
							return reject(err);
						}

						return resolve(record);
					});
				})
			};

			return client;
		}
	};
});
