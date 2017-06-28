'use strict';

const pkg = require('./package.json');
const createInstance = require('./lib');
const instance = createInstance(pkg);

module.exports = {
	serve: options => {
		instance('serve', options);
	},
	process: options => {
		instance('process', options);
	},
	deploy: options => {
		instance('deploy', options);
	},
	teardown: options => {
		instance('teardown', options);
	}
};
