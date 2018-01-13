/* global define */
'use strict';

define([
	'lodash',
	'path',
	'utils/index.js',
	'plugins/orchestrator/lib/spawn.js'
], (_, path, { logger }, spawn) => function pluginOrchestrator(options) {
	const settings = _.defaultsDeep(options, {
		stack: 'mvp',
		docker: 'unix:///var/run/docker.sock'
	});

	const env = _.defaultsDeep(Object.create(process.env), {
		HTTP_PORT: settings.port,
		DOCKER_HOST: settings.docker
	});

	const composeFilepath = path.join(__dirname, './docker-compose.yml');

	const { stack } = settings;

	const baseArgs = ['-f', composeFilepath, `--project=${stack}`];

	return {
		deploy: () => {
			const coreServices = [
				'server'
			];

			const backingServices = [
				'rethinkdb'
			];

			const selectedServices = settings.dev
				? _.concat(coreServices, backingServices)
				: coreServices;

			const opts = _.concat(baseArgs, ['up', '-d'], selectedServices);

			spawn({ opts, env }, (err, { code }) => {
				if (err) {
					logger.error(err);
				}

				process.exit(code); // eslint-disable-line no-process-exit
			});
		},
		teardown: () => {
			const opts = _.concat(baseArgs, ['down']);


			spawn({ opts, env }, (err, { code }) => {
				if (err) {
					logger.error(err);
				}

				process.exit(code); // eslint-disable-line no-process-exit
			});
		}
	};
});
