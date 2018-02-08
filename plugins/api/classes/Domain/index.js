/* global define, Promise */
'use strict';

define([
	'lodash',
	'-/store/index.js',
	'-/api/classes/Domain/resolvers/index.js',
	'-/api/classes/Domain/errors.js'
], (_, store, resolvers, ERRORS) => {

	class Domain extends Promise {
		constructor(handler) {
			super(handler);
			this.committed = false;
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

	function saveWithCtxt({ resolve, reject }) {
		return domain => {
			const object = domain
				.set('version', (domain.get('version') || 0) + 1)
				.toJSON();
			const args = {
				type: 'domain',
				object
			};

			const callback = callbackWithCtxt({ resolve, reject, object });

			store.edit(args, callback);
		};
	}

	function callbackWithCtxt({ resolve, reject, object }) {
		return (err, result) => {

			const skipped = _.get(result, 'skipped');

			if (err || skipped) {
				return reject(err || new Error(ERRORS.TRANSACTION_COMMIT_FAILED));
			}

			return resolve(object);
		};
	}

	return Domain;
});
