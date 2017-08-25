'use strict';

const plugin = 'api';

const _ = require('lodash');
const { Map } = require('Immutable');

const RESULT_OK = {
	code: 200,
	description: 'ok'
};

module.exports = function createAPIPlugin({ logger }) {
	return function APIPlugin(options) {
		const services = this;
		const { domain } = _.defaultsDeep(options, {
			domain: 'localhost:8000'
		});

		logger.debug('APIPlugin', __filename);

		services.add({ plugin, q: 'readDomain', host: domain }, (args, done) => {
			done(null, toImmutable({
				id: domain,
				version: 0,
				boundaryContexts: {
					admin: {
						aggregates: {
							domain: {
								root: 'Domain',
								queries: {},
								mutations: {
									addDomain: {
										parameters: {
											hostname: {
												type: 'STRING',
												required: true
											},
											webhook: {
												type: 'STRING'
											}
										}
									}
								}
							}
						}

						/*
					},
					model: {
						aggregates: {
							domain: {
								root: 'DomainModel'
							}
						}
						*/

					}
				},
				entities: {
					Domain: {
						name: 'STRING'

						/*
					},
					DomainModel: {
						name: 'STRING'
						*/

					}
				}
			}));
		});

		services.add({ plugin, q: 'readDomain' }, readDomain.bind(services));

		services.add({ plugin, cmd: 'editDomain' }, editDomain.bind(services));
	};
};

function toImmutable(value) {
	if (_.isObject(value)) {
		return Map(_.mapValues(value, v => toImmutable(v)));
	}

	return value;
}

function readDomain({ host }, done) {
	const services = this;

	const id = host;
	const params = {
		type: 'domains',
		id
	};

	services.act({ plugin: 'store', q: 'read', params }, (err, result) => {
		if (err || !result) {
			done(err);
		} else {
			const { version, boundedContexts, entities } = result;

			done(
				null,
				Map({
					id,
					version,
					boundedContexts: toImmutable(boundedContexts),
					entities: toImmutable(entities)
				})
			);
		}
	});
}

function editDomain({ domain }, done) {
	const services = this;

	domain = domain.set('version', domain.get('version') + 1);

	const params = {
		type: 'domains',
		object: domain.toJSON()
	};

	services.act({ plugin: 'store', cmd: 'edit', params }, (err, result) => {
		if (err) {
			done(err);
		} else {
			if (result.errors) {
				done(result.first_error);
			} else {
				done(null, RESULT_OK);
			}
		}
	});
}
