/* global define, Promise */
'use strict';

define([
	'lodash',
	'-/utils/index.js',
	'-/store/index.js',
	'-/api/classes/Domain/resolvers/index.js',
	'-/api/classes/Domain/errors.js'
], (_, { toImmutable }, store, resolvers, ERRORS) => {

	class Domain extends Promise {
		constructor(handler) {
			super(handler);
			this.committed = false;
		}

		static chain(params) {
			const { id } = params || {};

			return new Domain((resolve, reject) => {
				if (!id) {
					reject(new Error('Domain identifier was not provided'));
				}

				const onRead = onReadWithCtxt({ id, resolve });

				store.read({ type: 'domain', id }).then(onRead, reject);
			});
		}

		commit(done) {
			const handler = handlerWithContext(this);

			if (!done) {
				return new Promise(handler);
			}

			const fnResolve = _.partial(done, null);
			const fnReject = _.unary(done);

			return handler(fnResolve, fnReject);
		}
	}

	// add methods to the Domain class
	_.each(_.keys(resolvers), name => {
		Domain.prototype[name] = function(args) {
			const self = this;

			return new Domain((resolve, reject) => {
				self.then(result => {
					resolvers[name](result, args).then(resolve, reject);
				}, reject);
			});
		};
	});

	// HELPER FUNCTIONS

	function handlerWithContext(domain) {
		return (resolve, reject) => {
			if (!domain.committed) {
				domain.committed = true;

				const save = saveWithCtxt({ resolve, reject });

				domain.then(save, reject);
			} else {
				reject(new Error(ERRORS.TRANSACTION_ALREADY_COMMITTED));
			}
		};
	}

	function onReadWithCtxt({ id, resolve }) {
		return result => {
			const immutableResult = toImmutable(result || {
				id,
				version: 0,
				repositories: {
					default: {
						type: 'memory',
						entities: {}
					}
				}
			});

			return resolve(immutableResult);
		};
	}

	function saveWithCtxt({ resolve, reject }) {
		return domain => {
			const object = domain
				.set('version', (domain.get('version') || 0) + 1)
				.toJSON();
			const args = {
				type: 'domain',
				object
			};

			store
				.edit(args)
				.then(result => {
					const skipped = _.get(result, 'skipped');

					if (skipped) {
						return reject(new Error(ERRORS.TRANSACTION_COMMIT_FAILED));
					}

					return resolve(object);
				}, reject);
		};
	}

	return Domain;
});
