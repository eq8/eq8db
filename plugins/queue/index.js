/* globals define, Promise */
'use strict';

define([
	'-/logger/index.js',
	'immutable'
], (logger, { Map, List }) => {
	logger.warn('MVP instance is using a development version of the `-/queue` plugin');

	let queues = Map({});

	return {
		queue: (id, obj) => {
			const queue = queues.get(id) || List([]);

			queues = queues.set(id, queue.push(obj));

			return Promise.resolve();
		},
		dequeue: id => new Promise(resolve => {
			const queue = queues.get(id);
			const obj = queue.first();

			queues = queues.set(id, queue.shift());

			resolve(obj);
		})
	};
});
