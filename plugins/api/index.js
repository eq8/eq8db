'use strict';

const plugin = 'api';

const _ = require('lodash');
const { Map } = require('Immutable');

module.exports = function createAPIPlugin({ logger }) {
	return function APIPlugin(options) {
		const services = this;
		const { domain } = _.defaultsDeep(options, {
			domain: 'localhost:8000'
		});

		logger.debug('APIPlugin:', __filename);

		services.add({ plugin, q: 'domain', host: domain }, (args, done) => {
			done(null, toImmutable({
				boundaryContexts: {
					admin: {
						aggregates: {
							domain: {
								root: 'Domain',
								queries: {},
								mutations: {
									addDomain: {
										parameters: {
											domain: 'STRING'
										}
									}
								}
							}
						}
					},
					model: {
						aggregates: {
							domain: {
								root: 'DomainModel'
							}
						}
					}
				},
				entities: {
					Domain: {
						name: 'STRING'
					},
					DomainModel: {
						name: 'STRING'
					}
				}
			}));
		});

		services.add({ plugin, q: 'domain' }, ({ host }, done) => {
			const id = host; // TODO: add default host
			const params = {
				type: 'domains',
				id
			};

			services.act({ plugin: 'store', q: 'read', params }, (err, result) => {
				if (result) {
					const { version, aggregates, entities } = result;

					if (err) {
						done(err);
					} else {
						done(
							null,
							Map({
								id,
								version,
								aggregates: toImmutable(aggregates),
								entities: toImmutable(entities)
							})
						);
					}
				} else {
					done(
						null,
						Map({
							id,
							version: 0,
							aggregates: Map({}),
							entities: Map({})
						})
					);
				}
			});

		});
	};
};

function toImmutable(value) {
	if (_.isObject(value)) {
		return Map(_.mapValues(value, v => toImmutable(v)));
	}

	return value;
}
