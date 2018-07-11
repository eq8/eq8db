/* global define */
'use strict';

define([
	'-/logger/index.js'
], logger => function plugin(err, req, res, next) {
	logger.error('generic error', { err });
	res.status(500);
	next();
});
