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
			const params = {
				type: 'cluster'
			};

			const data = [];

			services.act({ plugin: 'store', q: 'browse', params }, (err, cursor) => {
				if (err) {
					done(err);
				} else {
					cursor.eachAsync(cluster => {
						data.push(cluster);
					})
						.then(() => done(null, { data }))
						.catch(done);
				}
			});
		});

		services.add({ plugin, type: 'q', q: 'domains' }, (args, done) => {
			done(null, {
				data: [
					{
						id: 'domain-id',
						name: 'domain-name'
					}
				]
			});
		});

		services.add({ plugin, type: 'q', q: 'databases' }, (args, done) => {
			done(null, {
				data: [
					{
						id: 'database-id',
						name: 'database-name'
					}
				]
			});
		});

		services.add({ plugin, type: 'q', q: 'aggregates' }, (args, done) => {
			done(null, {
				data: [
					{
						id: 'aggregate-id',
						name: 'aggregate-name'
					}
				]
			});
		});

		services.add({ plugin, type: 'q', q: 'entities' }, (args, done) => {
			done(null, {
				data: [
					{
						id: 'entity-id',
						name: 'entity-name'
					}
				]
			});
		});

		services.add({ plugin, type: 'q', q: 'attributes' }, (args, done) => {
			done(null, {
				data: [
					{
						id: 'attribute-id',
						name: 'attribute-name'
					}
				]
			});
		});

		services.add({ plugin, type: 'q', q: 'values' }, (args, done) => {
			done(null, {
				data: [
					{
						id: 'value-id',
						name: 'value-name'
					}
				]
			});
		});

		services.add({ plugin, type: 'q', q: 'node' }, ({ args }, done) => {
			done(null, {
				data: {
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
