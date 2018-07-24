/* global define */
'use strict';

define([
	'lodash',
	'url-parse',
	'rethinkdb',
	'-/logger/index.js'
], (_, parse, r, logger) => {
	let conn;

	const plugin = {
		async connect(options) {
			const settings = _.defaultsDeep(options, {
				storeUri: process.env.MVP_STORE_URI || 'rethinkdb://admin@127.0.0.1:28015'
			});

			const defaults = {
				protocol: 'rethinkdb',
				hostname: '127.0.0.1',
				port: 28015,
				username: 'admin'
			};

			const {
				protocol, hostname: host, port, username: user, password
			} = _.defaultsDeep(parse(settings.storeUri), defaults);

			if (protocol !== 'rethinkdb:') {
				throw new Error('Unsupported store protocol');
			}

			logger.debug('store setings:', settings);

			conn = await r.connect({ host, port, user, password });

			return { success: true };
		},
		browse({ type, where, skip, limit }) {
			let q = r.table(type);

			if (_.isObject(where)) {
				let tmp = q;

				_.each(_.keys(where), key => {
					tmp = q.getAll(where[key]);
				});

				q = tmp;
			}

			if (_.isInteger(skip)) {
				q = q.skip(skip);
			}

			if (_.isInteger(limit)) {
				q = q.limit(limit);
			}

			return q.run(conn);
		},
		read({ type, id }) {
			return r.table(type)
				.get(id)
				.run(conn);
		},
		edit({ type, object }) {
			return r.table(type)
				.get(object.id)
				.replace(doc => (
					(object.version > (doc.version || 0))
						? object
						: doc
				))
				.run(conn);
		},
		add({ type, objects }) {
			r.table(type)
				.insert(objects)
				.run(conn);
		},
		delete({ type, selection }) {
			return r.table(type)
				.getAll(r.args(selection))
				.delete()
				.run(conn);
		}
	};

	return plugin;
});
