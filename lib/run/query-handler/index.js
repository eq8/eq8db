'use strict';

module.exports = logger => ({
	listen: options => {
		logger.info('Query handler listening:', options);
	}
});
