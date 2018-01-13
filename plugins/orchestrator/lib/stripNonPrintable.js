/* global define */
'use strict';

define([], () => function stripNonPrintable(data) {
	return data
		.replace(/\x1B\[[0-9A-Z]{2}/g, '') // eslint-disable-line no-control-regex
		.replace(/[^\x20-\x7E]+/g, '');
});
