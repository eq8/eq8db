'use strict';

const r = require('rethinkdb');
const retryInterval = parseInt(process.env.RETRY_INTERVAL || '100', 10);
const retryMax = parseInt(process.env.RETRY_INTERVAL || '1000', 10);

let retryTimerId;
let retryCount = 1;

connectAndSeed();

function connectAndSeed() {
	r.connect({
		host: process.env.HOST || 'rethinkdb',
		port: process.env.PORT || 28015,
		username: process.env.USERNAME || 'admin',
		password: process.env.PASSWORD
	}).then(conn => {
		const table = 'domain';

		r.tableList().contains(table)
			.do(databaseExists => seed(!databaseExists ? r.tableCreate(table) : r))
			.run(conn)
			.then(result => {
				if (retryTimerId) {
					clearTimeout(retryTimerId);
				}

				console.log(result);
			}, () => {
				console.error('Failed to seed');

				retryTimerId = setTimeout(connectAndSeed, Math.min(retryInterval * retryCount++, retryMax));
			}); // eslint-disable-line no-console
	}, err => {
		console.error('Failed to connect');

		retryTimerId = setTimeout(connectAndSeed, retryInterval);
	});
}

function seed(chain) {
	const id = '127.0.0.1:8000';

	return chain
		.table('domain')
		.get(id)
		.replace({
			id,
			version: 1,
			boundedContexts: {
				api: {
					aggregates: {
						domain: {
							tags: {
								latest: '0.0.0',
								stable: '0.0.0'
							},
							versions: {
								'0.0': {
									inputEntities: {
										InputDomainID: {
											methods: {
												id: {
													returnType: {
														name: 'ID'
													}
												}
											}
										},
										InputDomainPagination: {
											methods: {
												skip: {
													returnType: {
														name: 'Int'
													}
												},
												length: {
													returnType: {
														name: 'Int'
													}
												},
												direction: {
													returnType: {
														name: 'Int'
													}
												}
											}
										}
									},
									entities: {
										Meta: {
											methods: {
												created: {
													resolver: {
														uri: 'http://resolver.utils.get/0.0?path=created'
													},
													returnType: {
														name: 'String'
													}
												},
												createdBy: {
													resolver: {
														uri: 'http://resolver.utils.get/0.0?path=createdBy'
													},
													returnType: {
														name: 'String'
													}
												},
												lastModified: {
													resolver: {
														uri: 'http://resolver.utils.get/0.0?path=lastModified'
													},
													returnType: {
														name: 'String'
													}
												},
												lastModifiedBy: {
													resolver: {
														uri: 'http://resolver.utils.get/0.0?path=lastModifiedBy'
													},
													returnType: {
														name: 'String'
													}
												}
											}
										},
										Repository: {
											methods: {
												name: {
													returnType: {
														name: 'String'
													}
												},
												uri: {
													returnType: {
														name: 'String'
													}
												}
											}
										},
										BoundedContext: {
											methods: {
												name: {
													returnType: {
														name: 'String'
													}
												}
											}
										},
										Aggregate: {
											methods: {
												name: {
													returnType: {
														name: 'String'
													}
												},
												entities: {
													returnType: {
														name: 'Entity',
														isCollection: true
													}
												},
												methods: {
													returnType: {
														name: 'Method',
														isCollection: true
													}
												},
												queries: {
													returnType: {
														name: 'Query',
														isCollection: true
													}
												},
												actions: {
													returnType: {
														name: 'Action',
														isCollection: true
													}
												}
											}
										},
										Entity: {
											methods: {
												name: {
													returnType: {
														name: 'String'
													}
												}
											}
										},
										Method: {
											methods: {
												name: {
													returnType: {
														name: 'String'
													}
												}
											}
										},
										Query: {
											methods: {
												name: {
													returnType: {
														name: 'String'
													}
												}
											}
										},
										Action: {
											methods: {
												name: {
													returnType: {
														name: 'String'
													}
												}
											}
										}
									},
									actions: {
										browse: {
											params: {
												in: 'InputDomainPagination'
											}
										},
										read: {
											params: {
												in: 'InputDomainID'
											}
										},
										add: {
											params: {
												in: 'InputDomainID'
											}
										},
										delete: {
											params: {
												in: 'InputDomainID'
											}
										}

										/*
										 * editDomain
										 * addRepository
										 * addBoundedContext
										 * addAggregate
										 * addMethod
										 * addAction
										 * addQuery
										 * addEntity
										 * addInputEntity
										 */

									},
									methods: {
										meta: {
											resolver: {
												uri: 'http://resolver.utils.get/0.0?path=meta'
											},
											returnType: {
												name: 'Meta'
											}
										}
									},
									queries: {
										load: {
											resolver: {
												uri: 'http://resolver.api.domain.query.load/0.0'
											},
											params: {
												in: 'InputDomainID'
											}
										}
									},

									// reducers: {}, // TODO: use for showing result aggregates

									repository: 'default',
									rootEntity: 'domain',
									schemaVersion: '0.0'
								}
							}
						}
					}
				}
			},
			repositories: {
				default: {
					uri: 'https://repository/api' // TODO: define API for repositories
				}
			}
		});
}
