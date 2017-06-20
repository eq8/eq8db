'use strict';

const plugin = 'processor';

module.exports = function createProcessorPlugin(commons) {
	return function processorPlugin() {
		const seneca = this;

		seneca.add({ plugin, cmd: 'start' }, function start() {
			console.log('started');
		});
	};
};
