'use strict';

const bootstrap = require('./bootstrap.js');

function run(action) {
	return (options, callback) => bootstrap(action, options, callback);
}

module.exports = {
	serve: run('serve'),
	process: run('process'),
	deploy: run('deploy'),
	teardown: run('teardown')
};
