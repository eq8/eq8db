'use strict';

module.exports = logger => ({
	listen: options => {
		logger.info('Event handler listening:', options);
	}
});
