/* global define */
'use strict';

define([
	'lodash',
	'event-emitter',
	'immutable',
	'-/store/index.js'
], (_, ee, { Map }, store) => {

	function Domain() {}

	Domain.prototype.addBoundedContext = function addBoundedContext(args) {
		const { name } = args;
		const domain = new Domain();

		this.on('reject', err => {
			domain.emit('reject', err);
		});

		this.on('resolve', result => {
			const boundedContexts = result.get('boundedContexts') || Map({});
			const resolved = result
				.set(
					'boundedContexts',
					boundedContexts.set(name, Map({}))
				);

			domain.emit('resolve', resolved);
		});

		return domain;
	};

	Domain.prototype.commit = function commit(done) {
		let committed = false;

		this.on('reject', err => {
			if (!committed) {
				committed = true;

				done(err);
			}
		});

		this.on('resolve', domain => {
			if (!committed) {
				committed = true;

				const args = {
					type: 'domain',
					object: domain
						.set('version', (domain.get('version') || 0) + 1)
						.toJSON()
				};

				store.edit(args, done);
			}
		});

	};

	ee(Domain.prototype);

	return Domain;
});
