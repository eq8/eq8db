/* globals Promise */

'use strict';

const plugin = 'graphql';

const graphqlHTTP = require('express-graphql');

module.exports = function createGraphQLAdminPlugin({ logger }) {
	const schema = require('./schema.js')({ logger });

	return function graphqlAdminPlugin() {
		const seneca = this;

		logger.debug('graphqlPlugin');

		const rootValue = {
			version: qEvent(seneca, 'version'),
			clusters: qEvent(seneca, 'clusters'),
			addCluster: cmdEvent(seneca, 'add-cluster'),
			addDomain: cmdEvent(seneca, 'add-domain'),
			addDatabase: cmdEvent(seneca, 'add-database')
		};

		const middleware = graphqlHTTP({ schema, rootValue, graphiql: true });

		/**
		 * returns the middleware for the admin API
		 */
		seneca.add({
			plugin, q: 'middleware', db: 'admin'
		}, (args, done) => done(null, { middleware }));
	};
};

function qEvent(seneca, q) {
	return function resolver(obj, args, ctxt) {
		return new Promise((resolve, reject) => {
			seneca.act({
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

function cmdEvent(seneca, cmd) {
	return function resolver(obj, args, ctxt) {
		return new Promise((resolve, reject) => {
			seneca.act({
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
