'use strict';

const plugin = 'processor';

module.exports = function processorPlugin() {
	const services = this;

	services.add({ plugin, cmd: 'start' }, () => {
		services.log.info('processor#start');
	});
};
