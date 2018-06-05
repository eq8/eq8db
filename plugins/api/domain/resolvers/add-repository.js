/* global define, Promise */
'use strict';

define([
	'immutable',
	'-/logger/index.js'
], (immutable, logger) => (result, args) => new Promise(resolve => {
	logger.trace('args:', args);
	resolve(result);
}));
