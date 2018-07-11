const r = require('rethinkdb');

const conn = r.connect({
	host: process.env.HOST || 'rethinkdb',
	port: process.env.PORT || 28015,
	username: process.env.USERNAME || 'admin',
	password: process.env.PASSWORD
}).then(conn => {
	const id = '127.0.0.1:8000';

	r
		.table('domain')
		.get(id)
		.replace({
			"id": id,
			"version": 1,
			"boundedContexts": {
				"api": {
					"aggregates": {
						"domain": {
							"tags": {
								"latest": "0.0.0",
								"stable": "0.0.0"
							},
							"versions": {
								"0.0": {
									"inputEntities": {
										"InputDomainID": {
											"methods": {
												"id": {
													"returnType": {
														"name": "ID"
													}
												}
											}
										},
										"InputDomainPagination": {
											"methods": {
												"skip": {
													"returnType": {
														"name": "Int"
													}
												},
												"length": {
													"returnType": {
														"name": "Int"
													}
												},
												"direction": {
													"returnType": {
														"name": "Int"
													}
												}
											}
										}
									},
									"entities": {
										"Meta": {
											"methods": {
												"created": {
													"returnType": {
														"name": "String"
													}
												},
												"createdBy": {
													"returnType": {
														"name": "String"
													}
												},
												"lastModified": {
													"returnType": {
														"name": "String"
													}
												},
												"lastModifiedBy": {
													"returnType": {
														"name": "String"
													}
												}
											}
										},
										"Repository": {
											"methods": {
												"name": {
													"returnType": {
														"name": "String"
													}
												},
												"uri": {
													"returnType": {
														"name": "String"
													}
												}
											}
										},
										"BoundedContext": {
											"methods": {
												"name": {
													"returnType": {
														"name": "String"
													}
												},
											}
										},
										"Aggregate": {
											"methods": {
												"name": {
													"returnType": {
														"name": "String"
													}
												},
												"entities": {
													"returnType": {
														"name": "Entity",
														"isCollection": true
													}
												},
												"methods": {
													"returnType": {
														"name": "Method",
														"isCollection": true
													}
												},
												"queries": {
													"returnType": {
														"name": "Query",
														"isCollection": true
													}
												},
												"actions": {
													"returnType": {
														"name": "Action",
														"isCollection": true
													}
												},
											}
										},
										"Entity": {
											"methods": {
												"name": {
													"returnType": {
														"name": "String"
													}
												},
											}
										},
										"Method": {
											"methods": {
												"name": {
													"returnType": {
														"name": "String"
													}
												}
											}
										},
										"Query": {
											"methods": {
												"name": {
													"returnType": {
														"name": "String"
													}
												}
											}
										},
										"Action": {
											"methods": {
												"name": {
													"returnType": {
														"name": "String"
													}
												}
											}
										},
									},
									"actions": {
										"browse": {
											"params": {
												"in": "InputDomainPagination"
											}
										},
										"read": {
											"params": {
												"in": "InputDomainID"
											}
										},
										"add": {
											"params": {
												"in": "InputDomainID"
											}
										},
										"delete": {
											"params": {
												"in": "InputDomainID"
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
									"methods": {
										"meta": {
											"returnType": {
												"name": "Meta"
											}
										}
									},
									"queries": {
										"load": {
											"params": {
												"in": "InputDomainID"
											}
										}
									},
									// "reducers": {}, // TODO: use for showing result aggregates
									"repository": "default",
									"rootEntity": "domain",
									"schemaVersion": "0.0"
								}
							}
						}
					}
				}
			},
			"repositories": {
				"default": {
					"uri": "https://repository/api" // TODO: define API for repositories
				}
			}
		})
		.run(conn)
		.then(console.log, console.err);
});

