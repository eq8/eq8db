'use strict';

const plugin = 'graphql';

module.exports = function createGraphQLPlugin(commons) {
	const { seneca } = commons;

	seneca.use(require('./admin.js')(commons), { plugin });
	seneca.use(require('./db.js')(commons), { plugin });
};
