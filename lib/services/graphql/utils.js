'use strict';

const _ = require('lodash');
const semver = require('semver');

module.exports = {
	getVersion: VERSION => {
		const MAJOR = semver.major(VERSION);
		const MINOR = semver.minor(VERSION);

		return `v${MAJOR}.${MINOR}`;
	},
	getHostname: req => _.get(req, 'headers.host')
};
