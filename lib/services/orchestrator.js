'use strict';

const plugin = 'orchestrator';

module.exports = function createOrchestratorPlugin(commons) {
	return function orchestratorPlugin() {
		const seneca = this;

		seneca.add({ plugin, cmd: 'deploy' }, function start() {
			console.log('deploy');
		});

		seneca.add({ plugin, cmd: 'teardown' }, function start() {
			console.log('teardown');
		});
	};
};
