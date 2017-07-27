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
			done(null, { data: `${MAJOR}.${MINOR}` });
		});

		services.add({ plugin, type: 'q', q: 'clusters' }, browse(services, 'clusters'));

		services.add({ plugin, type: 'q', q: 'domains' }, browse(services, 'domains'));

		services.add({ plugin, type: 'q', q: 'databases' }, browse(services, 'databases'));

		services.add({ plugin, type: 'q', q: 'aggregates' }, browse(services, 'aggregates'));

		services.add({ plugin, type: 'q', q: 'entities' }, browse(services, 'entities'));

		services.add({ plugin, type: 'q', q: 'attributes' }, browse(services, 'attributes'));

		services.add({ plugin, type: 'q', q: 'values' }, browse(services, 'values'));

		services.add({ plugin, type: 'q', q: 'node' }, read(services));
	};
};

function browse(services, type) {
	return function handler({ args }, done) {
		const { skip, limit } = args;
		const params = {
			type,
			skip,
			limit
		};

		const data = [];

		services.act({ plugin: 'store', q: 'browse', params }, (err, cursor) => {
			if (err) {
				done(err, { data });
			} else {
				cursor.eachAsync(row => {
					data.push(row);
				})
					.then(() => done(null, { data }))
					.catch(done);
			}
		});
	};
}

function read(services) {
	return function handler({ args }, done) {
		const { type, id } = args;
		const storeTypeMap = {
			Cluster: 'clusters',
			Domain: 'domains',
			Database: 'databases',
			Aggregate: 'aggregates',
			Entity: 'entities',
			Attribute: 'attributes',
			Value: 'values'
		};
		const params = {
			type: storeTypeMap[type],
			id
		};

		services.act({ plugin: 'store', q: 'read', params }, (err, data) => {
			if (err) {
				done(err, { data });
			} else {
				data.type = type;
				done(null, { data });
			}
		});
	};
}


