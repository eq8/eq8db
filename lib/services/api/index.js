'use strict';

const plugin = 'api';

const semver = require('semver');

module.exports = function createApiPlugin(commons) {
	const { VERSION, logger } = commons;

	const defaultHandler = require('./default.js')(commons);

	const MAJOR = semver.major(VERSION);
	const MINOR = semver.minor(VERSION);

	return function apiPlugin() {
		const services = this;

		logger.debug('apiPlugin');

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
