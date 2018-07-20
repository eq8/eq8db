/* global define */
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
		listen(options, done) {
			const { port } = _.defaultsDeep(options, {
				port: 8000
			});

			app.use(statusHandling.middleware());

			app.use(authentication.initialize());

			app.use('/:bctxt/:aggregate/:v', authentication.authenticate());

			app.use('/:bctxt/:aggregate/:v', controller.middleware());

			// TODO: only bubble up safe errors
			app.use(errorHandling);

			app.listen(port, done);
		},
		setState(newState) {
			statusHandling.setState(newState);
		}
	};

	return plugin;
});
