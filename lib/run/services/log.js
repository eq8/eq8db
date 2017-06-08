'use strict';

module.exports = function createLogPlugin({ logger }) {
	function Logger() {}
	Logger.preload = function preload() {

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
