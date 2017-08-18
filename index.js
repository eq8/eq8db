'use strict';

const bootstrap = require('./bootstrap.js');

function run(action) {
	return options => bootstrap(action, options);
}

module.exports = {
	serve: run('serve'),
	process: run('process'),
	deploy: run('deploy'),
	teardown: run('teardown')
};
