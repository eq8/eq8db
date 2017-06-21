'use strict';

const plugin = 'processor';

module.exports = function createProcessorPlugin({ logger }) {
	return function processorPlugin() {
		const seneca = this;

		seneca.add({ plugin, cmd: 'start' }, () => {
			logger.info('processor#start');
		});
	};
};
