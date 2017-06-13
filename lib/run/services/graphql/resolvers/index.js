'use strict';

module.exports = function loadResolvers(commons, seneca) {
	const dispatch = require('./dispatcher')(commons, seneca);

	return {
		addDatabase: dispatch('add-database')
	};
};
