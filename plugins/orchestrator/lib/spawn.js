/* global define */
'use strict';

define([
	'utils/index.js',
	'child_process',
	'readline',
	'./stripNonPrintable.js'
], ({ logger }, childProcess, readline, stripNonPrintable) => {
	const spawn = childProcess.spawn;

	return function pluginSpawn({ opts, env }, done) {
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

	};
});

