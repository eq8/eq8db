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

module.exports = function createOrchestratorPlugin({ logger }) {
	return function orchestratorPlugin(options) {
		const services = this;

		const settings = _.defaultsDeep(options, {
			stack: 'eq8db',
			docker: 'unix:///var/run/docker.sock'
		});

		const env = _.defaultsDeep(Object.create(process.env), {
			HTTP_PORT: settings.port,
			DOCKER_HOST: settings.docker
		});

		const composeFilepath = path.join(__dirname, './docker-compose.yml');

		const stackName = settings.stack || 'eq8db';

		const baseArgs = ['-f', composeFilepath, `--project=${stackName}`];

		services.add({ plugin, cmd: 'spawn' }, ({ opts }, done) => {
			const deploy = spawn('docker-compose', opts, { env });

			readline.createInterface({
				input: deploy.stdout,
				terminal: false
			}).on('line', data => {
				const output = stripNonPrintable(data);

				if (output.length) {
					logger.info(output);
				}
			});

			readline.createInterface({
				input: deploy.stderr,
				terminal: false
			}).on('line', data => {
				const output = stripNonPrintable(data);

				if (output.length) {
					logger.error(output);
				}
			});

			deploy.on('close', code => {
				done(null, { code });
			});
		});

		services.add({ plugin, cmd: 'deploy' }, function deploy() {
			const coreServices = [
				'manager',
				'worker'
			];

			const backingServices = [
				'elasticsearch',
				'mysqlmgr',
				'mysql',
				'rabbitmq',
				'redis',
				'rethinkdb'
			];

			const selectedServices = options.dev
				? _.concat(coreServices, backingServices)
				: coreServices;

			const opts = _.concat(baseArgs, ['up', '-d'], selectedServices);

			this.act({ plugin, cmd: 'spawn', opts }, (err, { code }) => {
				if (err) {
					logger.error(err);
				}

				process.exit(code); // eslint-disable-line no-process-exit
			});
		});

		services.add({ plugin, cmd: 'teardown' }, function teardown() {
			const opts = _.concat(baseArgs, ['down']);

			this.act({ plugin, cmd: 'spawn', opts }, (err, { code }) => {
				if (err) {
					logger.error(err);
				}

				process.exit(code); // eslint-disable-line no-process-exit
			});
		});
	};
};
