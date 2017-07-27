'use strict';

const plugin = 'store';

const _ = require('lodash');
const parse = require('url-parse');
const r = require('rethinkdb');

module.exports = function createStorePlugin({ logger }) {
	return function storePlugin(options) {
		const services = this;

		const settings = _.defaultsDeep(options, {
			store: 'rethinkdb://admin@127.0.0.1:28015'
		});

		logger.debug('storePlugin');

		let conn;

		services.add({ init: plugin }, (args, done) => {
			const store = _.defaultsDeep(parse(settings.store), {
				protocol: 'rethinkdb',
				hostname: '127.0.0.1',
				port: 28015,
				username: 'admin'
			});

			if (store.protocol === 'rethinkdb:') {
				r.connect({
					host: store.hostname,
					port: store.port,
					user: store.username,
					password: store.password
				}, (err, newConn) => {
					conn = newConn;
					done(err);
				});
			}
		});

		function connCheck(handler) {
			return (args, done) => {
				if (conn) {
					handler(args, done);
				} else {
					done(new Error('Not connected to a store'));
				}
			};
		}

		services.add({ plugin, q: 'browse' }, connCheck(({ params }, done) => {
			let q = r.table(params.type);

			if (_.isObject(params.where)) {
				let tmp = q;

				_.each(_.keys(params.where), key => {
					tmp = q.getAll(params.where[key]);
				});

				q = tmp;
			}

			if (_.isInteger(params.skip)) {
				q = q.skip(params.skip);
			}

			if (_.isInteger(params.limit)) {
				q = q.limit(params.limit);
			}

			q.run(conn, done);
		}));

		services.add({ plugin, q: 'read' }, connCheck(({ params }, done) => {
			r.table(params.type)
				.get(params.id)
				.run(conn, done);
		}));

		services.add({ plugin, cmd: 'edit' }, connCheck(({ params }, done) => {
			r.table(params.type)
				.insert(params.objects, {
					conflict: (id, oldDoc, newDoc) => {
						if (newDoc.version > oldDoc.version) {
							return newDoc;
						}

						return oldDoc;
					}
				})
				.run(conn, done);
		}));

		services.add({ plugin, cmd: 'add' }, connCheck(({ params }, done) => {
			r.table(params.type)
				.insert(params.objects)
				.run(conn, done);
		}));

		services.add({ plugin, cmd: 'delete' }, connCheck(({ params }, done) => {
			const deletes = _.isArray(params.selection)
				? _.map(params.selection, id => ({ id, deleted: true }))
				: { id: params.selection, deleted: true };

			r.table(params.type)
				.insert(deletes, {
					conflict: (id, oldDoc, newDoc) => {
						if (newDoc.version > oldDoc.version) {
							return newDoc;
						}

						return oldDoc;
					}
				})
				.run(conn, done);
		}));

		return {
			name: plugin
		};
	};
};
