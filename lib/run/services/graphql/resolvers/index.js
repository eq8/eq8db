'use strict';

module.exports = function loadResolvers(commons, seneca) {
	const dispatch = require('./dispatcher')(commons, seneca);

	return {
		addCluster: dispatch('add-cluster'),
		addDatabase: dispatch('add-database')
	};
};
