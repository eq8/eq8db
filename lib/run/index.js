'use strict';

module.exports = function proc({ _, logger }) {
	const eventHandler = require('./event-handler');
	const queryHandler = require('./query-handler');

	return function run(options) {
		logger.info('run:', options);

		eventHandler.listen(_.pick(options, ['amqpDsn', 'amqpQueue']));
		queryHandler.listen(_.pick(options, ['httpPort']));
	};
};
