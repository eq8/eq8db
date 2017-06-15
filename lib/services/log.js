'use strict';

function Logger() {}

module.exports = function createLogPlugin({ logger }) {
	logger.debug('createLogPlugin');

	Logger.preload = function preload() {
		logger.debug('Logger.preload');

		return {
			extend: {
				logger: (context, payload) => {
					logger[payload.level]('seneca:', payload);
				}
			}
		};
	};

	return Logger;
};

