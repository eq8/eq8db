'use strict';

module.exports = `
type Domain {
	id: String
	name: String
}

type Cluster {
	id: String
	name: String
	domains(api: String!): [Domain]
}

type Query {
	version: String
	clusters(api: String!): [Cluster]
}
`;
