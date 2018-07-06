const r = require('rethinkdb');

const conn = r.connect({
	host: process.env.HOST || 'rethinkdb',
	port: process.env.PORT || 28015,
	username: process.env.USERNAME || 'admin',
	password: process.env.PASSWORD
}).then(conn => {
	const id = '127.0.0.1:8000';

	r.tableCreate('domain');

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
									"entities": {
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
										"create": {
											"params": {
												"id": "ID"
											}
										},
										"load": {
											"params": {
												"id": "ID"
											}
										},
										"delete": {
											"params": {
												"id": "ID"
											}
										},
										"addRepository": {
											"params": {
												"name": "String",
												"uri": "String",
											}
										}
									},
									"methods": {
										"id": {
											"returnType": {
												"name": "ID"
											}
										},
										"version": {
											"returnType": {
												"name": "Int"
											}
										/* TODO
										},
										"repositories": {
											"returnType": {
												"name": "Repository",
												"isCollection": true
											}
										*/
										}
									},
									"queries": {
										"load": {
											"params": {
												"id": "ID"
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

