'use strict';

const { success } = require('./results.js');

module.exports = function loadApi({ logger }) {
	return function addDatabase(args, done) {
		logger.debug('addDatabase:', args);

		/*
		 * TODO
		 * - generate an id for the database
		 * - pick from a list of shards
		 * - add a --discover-host / --discovery-port for run
		 * - remove other options on run, add shards via API from now on
		 * - add an entry in rethink with an initial 'down' status - 1st phase
		 *   - include shard info
		 * - create a table for the vcs
		 * - create an index in elasticsearch
		 * - update status in rethink that it's 'up' - 2nd phase
		 */

		done(null, success);
	};
};
