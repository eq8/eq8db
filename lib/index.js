'use strict';

const winston = require('winston');
const Logger = winston.Logger;

module.exports = {
	getLogger(level) {
		return new Logger({
			levels: {
				trace: 5, debug: 4, info: 3, warn: 2, error: 1, fatal: 0
			},
			colors: {
				trace: 'grey',
				debug: 'blue',
				info: 'green',
				warn: 'yellow',
				error: 'red',
				fatal: 'magenta'
			},
			transports: [
				new (winston.transports.Console)({
					level: level || 'info',
					colorize: true
				})
			]
		});
	},
	api(commons) {
		const run = require('./run')(commons);
		const manage = require('./manage')(commons);

		return {
			run,
			manage
		};
	}
};

