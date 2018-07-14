'use strict';

const r = require('rethinkdb');

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
		.then(console.log, console.err); // eslint-disable-line no-console
});

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
														uri: 'http://utils-get/?path=created'
													},
													returnType: {
														name: 'String'
													}
												},
												createdBy: {
													resolver: {
														uri: 'http://utils-get/?path=createdBy'
													},
													returnType: {
														name: 'String'
													}
												},
												lastModified: {
													resolver: {
														uri: 'http://utils-get/?path=lastModified'
													},
													returnType: {
														name: 'String'
													}
												},
												lastModifiedBy: {
													resolver: {
														uri: 'http://utils-get/?path=lastModifiedBy'
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
												uri: 'http://utils-get/?path=meta'
											},
											returnType: {
												name: 'Meta'
											}
										}
									},
									queries: {
										load: {
											resolver: {
												uri: 'http://api-domain-query-load/'
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
