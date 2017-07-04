'use strict';

module.exports = `
interface Node {
	id: String!
	type: String!
}

type Value implements Node {
	id: String!
	type: String!
	database: String
	name: String
	validation: String
}

type Attribute implements Node {
	id: String!
	type: String!
	entity: String
	name: String
	value: Value
}

type Entity implements Node {
	id: String!
	type: String!
	name: String
	database: String
	attributes(api: String!, query: String, first: Int, after: String): [Attribute]
}

type Aggregate implements Node {
	id: String!
	type: String!
	database: String
	name: String
	root: String
	isCollection: Boolean
}

type Database implements Node {
	id: String!
	type: String!
	domain: String
	name: String
	values(api: String!, query: String, first: Int, after: String): [Value]
	entities(api: String!, query: String, first: Int, after: String): [Entity]
	aggregates(api: String!, query: String, first: Int, after: String): [Aggregate]
}

type Domain implements Node {
	id: String!
	type: String!
	cluster: String
	name: String
	databases(api: String!, query: String, first: Int, after: String): [Database]
}

type Cluster implements Node {
	id: String!
	type: String!
	name: String
	domains(api: String!, query: String, first: Int, after: String): [Domain]
}

type Query {
	version: String
	clusters(api: String!, query: String, first: Int, after: String): [Cluster]
	node(api: String!, id: String!, type: String!): Node
}
`;
