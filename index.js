'use strict';

const pkg = require('./package.json');
const instantiate = require('./lib')(pkg);

function run(action) {
	return options => instantiate(action, options);
}

module.exports = {
	serve: run('serve'),
	process: run('process'),
	deploy: run('deploy'),
	teardown: run('teardown')
};
