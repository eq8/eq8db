/* global define, Promise */
'use strict';

define([
	'lodash',
	'url-parse',
	'rethinkdb',
	'-/logger/index.js'
], (_, parse, r, logger) => {
	let conn;

	const plugin = {
		connect: function connect(options) {
			const settings = _.defaultsDeep(options, {
				store: 'rethinkdb://admin@127.0.0.1:28015'
			});

			const storeOpts = _.defaultsDeep(parse(settings.store), {
				protocol: 'rethinkdb',
				hostname: '127.0.0.1',
				port: 28015,
				username: 'admin'
			});

			if (storeOpts.protocol === 'rethinkdb:') {
				logger.debug('store setings:', settings);

				return r.connect({
					host: storeOpts.hostname,
					port: storeOpts.port,
					user: storeOpts.username,
					password: storeOpts.password
				}).then(newConn => {
					conn = newConn;
				});
			}

			return Promise.reject(new Error('Unsupported store protocol'));
		},
		browse: connCheck(({ type, where, skip, limit }) => {
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
		}),
		read: connCheck(({ type, id }) => r.table(type)
			.get(id)
			.run(conn)
		),
		edit: connCheck(({ type, object }) => r.table(type)
			.get(object.id)
			.replace(doc => (
				(object.version > (doc.version || 0))
					? object
					: doc
			))
			.run(conn)
		),
		add: connCheck(({ type, objects }) => r.table(type)
			.insert(objects)
			.run(conn)
		),
		delete: connCheck(({ type, selection }) => r.table(type)
			.getAll(r.args(selection))
			.delete()
			.run(conn)
		)
	};

	function connCheck(handler) {
		return args => {
			if (conn) {
				return handler(args);
			}

			return Promise.reject(new Error('Not connected to a store'));
		};
	}

	return plugin;
});
