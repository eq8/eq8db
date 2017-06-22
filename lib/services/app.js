'use strict';

const plugin = 'eq8db';

module.exports = function app() {
	const seneca = this;

	seneca.add({ plugin, cmd: 'listen' }, function listen(args, done) {
		this.act({ plugin: 'server', cmd: 'listen' }, done);
	});

	seneca.add({ plugin, cmd: 'start' }, function start(args, done) {
		this.act({ plugin: 'processor', cmd: 'start' }, done);
	});

	seneca.add({ plugin, cmd: 'deploy' }, function deply(args, done) {
		this.act({ plugin: 'orchestrator', cmd: 'deploy' }, done);
	});

	seneca.add({ plugin, cmd: 'teardown' }, function teardown(args, done) {
		this.act({ plugin: 'orchestrator', cmd: 'teardown' }, done);
	});
};
