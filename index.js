'use strict';

const pkg = require('./package.json');
const createInstance = require('./lib');
const instance = createInstance(pkg);

module.exports = {
	listen: options => {
		instance('listen', options);
	},
	start: options => {
		instance('start', options);
	},
	deploy: options => {
		instance('deploy', options);
	},
	teardown: options => {
		instance('teardown', options);
	},
	status: options => {
		instance('status', options);
	}
};
