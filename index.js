'use strict';

const _ = require('lodash');
const path = require('path');
const boot = require('@eq8/mvp-boot');

module.exports = function mvp(args) {
	const config = _.defaultsDeep({}, args, {
		overrides: {
			'*': {
				'-/ext/controller': path.join(__dirname, './lib/ext/controller')
			}
		}
	});

	return boot(config);
};
