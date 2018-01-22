/* global define */
'use strict';

define([
	'lodash',
	'url-parse',
	'rethinkdb'
], (_, parse, r) => {
	let conn;

	function connCheck(handler) {
		return (args, done) => {
			if (conn) {
				handler(args, done);
			} else {
				done(new Error('Not connected to a store'));
			}
		};
	}

	return {
		connect: function connect(options, done) {
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
				r.connect({
					host: storeOpts.hostname,
					port: storeOpts.port,
					user: storeOpts.username,
					password: storeOpts.password
				}, (err, newConn) => {
					conn = newConn;
					done(err);
				});
			}
		},
		browse: connCheck(({ type, where, skip, limit }, done) => {
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

			q.run(conn, done);
		}),
		read: connCheck(({ type, id }, done) => {
			r.table(type)
				.get(id)
				.run(conn, done);
		}),
		edit: connCheck(({ type, object }, done) => {
			r.table(type)
				.get(object.id)
				.replace(doc => (
					(object.version > (doc.version || 0))
						? object
						: doc
				))
				.run(conn, done);
		}),
		add: connCheck(({ type, objects }, done) => {
			r.table(type)
				.insert(objects)
				.run(conn, done);
		}),
		delete: connCheck(({ type, selection }, done) => {
			r.table(type)
				.getAll(r.args(selection))
				.delete()
				.run(conn, done);
		})
	};
});
