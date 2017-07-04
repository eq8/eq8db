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
		const services = this;

		const settings = _.defaultsDeep(options, {
			store: 'rethinkdb://admin@127.0.0.1:28015'
		});

		logger.debug('apiPlugin');

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
				}, err => done(err));
			}
		});

		services.add({ plugin, type: 'cmd' }, defaultHandler);

		services.add({ plugin, type: 'q', q: 'version' }, (args, done) => {
			done(null, { version: `${MAJOR}.${MINOR}` });
		});

		services.add({ plugin, type: 'q', q: 'clusters' }, (args, done) => {
			done(null, {
				clusters: [{
					id: 'cluster-id'
				}]
			});
		});

		services.add({ plugin, type: 'q', q: 'domains' }, (args, done) => {
			done(null, {
				domains: [
					{
						id: 'domain-id',
						name: 'domain-name'
					}
				]
			});
		});

		services.add({ plugin, type: 'q', q: 'databases' }, (args, done) => {
			done(null, {
				databases: [
					{
						id: 'database-id',
						name: 'database-name'
					}
				]
			});
		});

		services.add({ plugin, type: 'q', q: 'aggregates' }, (args, done) => {
			done(null, {
				aggregates: [
					{
						id: 'aggregate-id',
						name: 'aggregate-name'
					}
				]
			});
		});

		services.add({ plugin, type: 'q', q: 'entities' }, (args, done) => {
			done(null, {
				entities: [
					{
						id: 'entity-id',
						name: 'entity-name'
					}
				]
			});
		});

		services.add({ plugin, type: 'q', q: 'attributes' }, (args, done) => {
			done(null, {
				attributes: [
					{
						id: 'attribute-id',
						name: 'attribute-name'
					}
				]
			});
		});

		services.add({ plugin, type: 'q', q: 'values' }, (args, done) => {
			done(null, {
				values: [
					{
						id: 'value-id',
						name: 'value-name'
					}
				]
			});
		});

		services.add({ plugin, type: 'q', q: 'node' }, ({ args }, done) => {
			done(null, {
				node: {
					id: 'node-id',
					type: args.type,
					name: 'node-name'
				}
			});
		});

		return {
			name: plugin
		};
	};
};
