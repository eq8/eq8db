'use strict';

const plugin = 'processor';

module.exports = function createProcessorPlugin({ logger }) {
	return function processorPlugin() {
		const services = this;

		services.add({ plugin, cmd: 'start' }, () => {
			logger.info('processor#start');
		});
	};
};
