'use strict';

module.exports = `
enum Primitive {
	ID
	INT
	FLOAT
	STRING
	BOOLEAN
}

type Value {
	id: String!
	name: String
	primitive: Primitive
	validation: String
}

type Attribute {
	id: String!
	name: String
	value: Value
}

type Entity {
	id: String!
	name: String
	attributes(api: String!, query: String, skip: Int, limit: Int): [Attribute]
}

type Aggregate {
	id: String!
	name: String
	root: String
	isCollection: Boolean
}

type Database {
	id: String!
	name: String
	values(api: String!, query: String, skip: Int, limit: Int): [Value]
	entities(api: String!, query: String, skip: Int, limit: Int): [Entity]
	aggregates(api: String!, query: String, skip: Int, limit: Int): [Aggregate]
}

type Result {
	code: String!
	description: String
}

type Query {
	version: String
	databases(api: String!, query: String, skip: Int, limit: Int): [Database]
}

type Mutation {
	addDatabase(api: String!, name: String!): Result
}
`;
