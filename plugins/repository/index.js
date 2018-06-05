/* globals define, Promise */
'use strict';

define([
	'lodash',
	'immutable',
	'-/logger/index.js'
], (_, { Map }, logger) => {
	logger.warn('MVP instance is using a development version of the `-/repository` plugin');

	let db = Map({});

	return {
		connect: (config, { domain, aggregate, v }) => {
			const rootEntity = aggregate;
			const schemaVersion = v;

			const client = {
				load: (args, opts) => new Promise((resolve, reject) => {
					const { id, version } = _.defaultsDeep(args, { version: 0 });
					const { create } = _.defaultsDeep(opts, { create: false });

					if (!id) {
						return reject(new Error('Unable to load a record without an id'));
					}

					const path = `${domain}/${rootEntity}/${schemaVersion}/${id}`;

					const record = db.get(path);
					const result = (!record && create)
						? { id, version }
						: record;

					if (!result) {
						return reject(new Error('Unable to load record:', id));
					}

					return resolve(result);
				}),
				save: args => new Promise((resolve, reject) => {
					const { id, version } = _.defaultsDeep(args, { version: 0 });
					const path = `${domain}/${rootEntity}/${schemaVersion}/${id}`;

					const record = db.get(path) || { id, version: 0 };

					logger.trace('record:', record);

					const conflict = version < _.get(record, 'version');

					if (conflict) {
						return reject(new Error('Unable to save record', { id, version }));
					}

					db = db.set(path, args);

					return resolve(args);
				})
			};

			return client;
		}
	};
});
