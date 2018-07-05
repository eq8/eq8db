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
									"actions": {
										"load": {
											"params": {
												"id": "ID"
											}
										},
										"action": {
											"params": {
												"id": "ID"
											}
										}
									},
									"methods": {
										"id": {
											"returnType": "ID"
										},
										"version": {
											"returnType": "Int"
										},
										"foo": {
											"params": {
												"bar": "Boolean"
											},
											"returnType": "Boolean"
										}
									},
									"queries": {
										"load": {
											"params": {
												"id": "ID"
											}
										}
									},
									"reducers": {}, // TODO: use for showing result aggregates
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
					"entities": {},
					"uri": "https://repository"
				}
			}
		})
		.run(conn)
		.then(console.log, console.err);
});

