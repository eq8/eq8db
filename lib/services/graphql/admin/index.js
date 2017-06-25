/* globals Promise */

'use strict';

const plugin = 'graphql';

const graphqlHTTP = require('express-graphql');

module.exports = function createGraphQLAdminPlugin({ logger }) {
	const schema = require('./schema.js')({ logger });

	return function graphqlAdminPlugin() {
		const services = this;

		logger.debug('graphqlPlugin');

		const rootValue = {
			version: qEvent(services, 'version'),
			clusters: qEvent(services, 'clusters'),
			addCluster: cmdEvent(services, 'add-cluster'),
			addDomain: cmdEvent(services, 'add-domain'),
			addDatabase: cmdEvent(services, 'add-database')
		};

		const middleware = graphqlHTTP({ schema, rootValue, graphiql: true });

		/**
		 * returns the middleware for the admin API
		 */
		services.add({
			plugin, q: 'middleware', db: 'admin'
		}, (args, done) => done(null, { middleware }));
	};
};

function qEvent(services, q) {
	return function resolver(obj, args, ctxt) {
		return new Promise((resolve, reject) => {
			services.act({
				plugin: 'api', type: 'q', q, obj, args, ctxt
			}, (err, result) => {
				if (err) {
					reject(err);
				} else {
					resolve(result[q]);
				}
			});
		});
	};
}

function cmdEvent(services, cmd) {
	return function resolver(obj, args, ctxt) {
		return new Promise((resolve, reject) => {
			services.act({
				plugin: 'api', type: 'cmd', cmd, obj, args, ctxt
			}, (err, { code, status }) => {
				if (err) {
					reject(err);
				} else {
					resolve({ code, status });
				}
			});
		});
	};
}
