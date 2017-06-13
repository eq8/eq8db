/* globals Promise */

'use strict';

module.exports = function createDispatcher({ _ }, seneca) {
	return function dispatch(cmd) {
		return function resolver(obj, args, ctxt) {
			return new Promise((resolve, reject) => {
				seneca.act({
					plugin: 'api', cmd: `${cmd}`, args, ctxt
				}, (err, result) => {
					if (err) {
						reject(err);
					} else {
						resolve(_.pick(result, ['code', 'status']));
					}
				});
			});
		};
	};
};
