'use strict';

const plugin = 'api';

const _ = require('lodash');
const semver = require('semver');
const parse = require('url-parse');
const r = require('rethinkdb');

module.exports = function createApiPlugin(commons) {
	const { VERSION, logger } = commons;

	const defaultHandler = require('./default.js')(commons);

	const MAJOR = semver.major(VERSION);
	const MINOR = semver.minor(VERSION);

	return function apiPlugin(options) {
		const seneca = this;

		const settings = _.defaultsDeep(options, {
			store: 'rethinkdb://admin@127.0.0.1:28015'
		});

		logger.debug('apiPlugin');

		seneca.add({ init: plugin }, (args, done) => {
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
				}, err => done(err));
			}
		});

		seneca.add({ plugin, type: 'cmd' }, defaultHandler);

		seneca.add({ plugin, type: 'q', q: 'version' }, (args, done) => {
			done(null, { version: `${MAJOR}.${MINOR}` });
		});

		seneca.add({ plugin, type: 'q', q: 'clusters' }, (args, done) => {
			done(null, { clusters: [{
				id: 'cluster-id',
				name: 'cluster-name',
				domains: [
					{
						id: 'domain-id',
						name: 'domain-name',
						databases: [
							{
								id: 'database-id',
								name: 'database-name',
								warehouse: 'warehouse'
							}
						]
					}
				]
			}]
			});
		});

		return {
			name: plugin
		};
	};
};
