'use strict';

const plugin = 'store';

const _ = require('lodash');
const parse = require('url-parse');
const r = require('rethinkdb');

module.exports = function storePlugin(options) {
	const services = this;

	const settings = _.defaultsDeep(options, {
		store: 'rethinkdb://admin@127.0.0.1:28015'
	});

	services.log.debug('storePlugin', __filename);

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
		const { type, id } = params;

		r.table(type)
			.get(id)
			.run(conn, done);
	}));

	services.add({ plugin, cmd: 'edit' }, connCheck(({ params }, done) => {
		const { type, object } = params;

		r.table(type)
			.get(object.id)
			.replace(doc => (
				(object.version > (doc.version || 0))
					? object
					: doc
			))
			.run(conn, done);
	}));

	services.add({ plugin, cmd: 'add' }, connCheck(({ params }, done) => {
		const { type, objects } = params;

		r.table(type)
			.insert(objects)
			.run(conn, done);
	}));

	services.add({ plugin, cmd: 'delete' }, connCheck(({ params }, done) => {
		const { type, selection } = params;

		r.table(type)
			.getAll(r.args(selection))
			.delete()
			.run(conn, done);
	}));

	return {
		name: plugin
	};
};
