'use strict';

const plugin = 'eq8db';

module.exports = function app() {
	const seneca = this;

	seneca.add({ plugin, cmd: 'listen' }, function listen() {
		this.act({ plugin: 'server', cmd: 'listen' });
	});

	seneca.add({ plugin, cmd: 'start' }, function start() {
		this.act({ plugin: 'processor', cmd: 'start' });
	});

	seneca.add({ plugin, cmd: 'deploy' }, function start() {
		this.act({ plugin: 'orchestrator', cmd: 'deploy' });
	});

	seneca.add({ plugin, cmd: 'teardown' }, function start() {
		this.act({ plugin: 'orchestrator', cmd: 'teardown' });
	});
};
