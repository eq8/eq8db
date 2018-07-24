/* global define, Promise */
'use strict';

define([
	'lodash',
	'express',
	'-/logger/index.js',
	'-/authentication/index.js',
	'-/controller/index.js',
	'-/server/status-handling.js',
	'-/server/error-handling.js'
], (
	_,
	express,
	logger,
	authentication,
	controller,
	statusHandling,
	errorHandling
) => {
	const app = express();

	const plugin = {
		listen(options) {
			const { port } = _.defaultsDeep(options, {
				port: 8000
			});

			app.use(statusHandling.middleware());

			app.use(authentication.initialize());

			app.use('/:bctxt/:aggregate/:v', authentication.authenticate());

			app.use('/:bctxt/:aggregate/:v', controller.middleware());

			// TODO: only bubble up safe errors
			app.use(errorHandling);

			return new Promise((resolve, reject) => {
				app.listen(port, err => (err ? reject(err) : resolve({ success: true })));
			});
		},
		setState(newState) {
			statusHandling.setState(newState);
		}
	};

	return plugin;
});
