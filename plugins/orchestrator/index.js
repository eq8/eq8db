'use strict';

const plugin = 'orchestrator';

const _ = require('lodash');
const spawn = require('child_process').spawn;
const path = require('path');
const readline = require('readline');

function stripNonPrintable(data) {
	return data
		.replace(/\x1B\[[0-9A-Z]{2}/g, '') // eslint-disable-line no-control-regex
		.replace(/[^\x20-\x7E]+/g, '');
}

module.exports = function orchestratorPlugin(options) {
	const services = this;

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

	services.add({ plugin, cmd: 'spawn' }, ({ opts }, done) => {
		const deploy = spawn('docker-compose', opts, { env });

		readline.createInterface({
			input: deploy.stdout,
			terminal: false
		}).on('line', data => {
			const output = stripNonPrintable(data);

			if (output.length) {
				services.log.info(output);
			}
		});

		readline.createInterface({
			input: deploy.stderr,
			terminal: false
		}).on('line', data => {
			const output = stripNonPrintable(data);

			if (output.length) {
				services.log.error(output);
			}
		});

		deploy.on('close', code => {
			done(null, { code });
		});
	});

	services.add({ plugin, cmd: 'deploy' }, () => {
		const coreServices = [
			'server',
			'processor'
		];

		const backingServices = [
			'elasticsearch',
			'mysqlmgr',
			'mysql',
			'rabbitmq',
			'redis',
			'rethinkdb'
		];

		const selectedServices = settings.dev
			? _.concat(coreServices, backingServices)
			: coreServices;

		const opts = _.concat(baseArgs, ['up', '-d'], selectedServices);

		services.act({ plugin, cmd: 'spawn', opts }, (err, { code }) => {
			if (err) {
				services.log.error(err);
			}

			process.exit(code); // eslint-disable-line no-process-exit
		});
	});

	services.add({ plugin, cmd: 'teardown' }, () => {
		const opts = _.concat(baseArgs, ['down']);

		services.act({ plugin, cmd: 'spawn', opts }, (err, { code }) => {
			if (err) {
				services.log.error(err);
			}

			process.exit(code); // eslint-disable-line no-process-exit
		});
	});
};
