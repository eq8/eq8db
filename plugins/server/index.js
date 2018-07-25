/* global define, Promise */
'use strict';

define([
	'lodash',
	'express',
	'-/logger/index.js',
	'-/authentication/index.js',
	'-/controller/index.js',
	'-/server/status-handler.js',
	'-/server/utils.js'
], (
	_,
	express,
	logger,
	authentication,
	controller,
	statusHandler,
	utils
) => {
	const app = express();

	const plugin = {
		listen(options) {
			const { port } = _.defaultsDeep(options, {
				port: 8000
			});

			app.use(statusHandler.middleware());

			app.use(authentication.initialize());

			app.use(utils.contextProvider());

			app.use('/:bctxt/:aggregate/:v', authentication.authenticate());

			app.use('/:bctxt/:aggregate/:v', controller.middleware());

			// TODO: only bubble up safe errors
			app.use(utils.errorHandler());

			return new Promise((resolve, reject) => {
				app.listen(port, err => (err ? reject(err) : resolve({ success: true })));
			});
		},
		setState(newState) {
			statusHandler.setState(newState);
		}
	};

	return plugin;
});
