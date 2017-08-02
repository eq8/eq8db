'use strict';

module.exports = `
enum Primitive {
	INT
	FLOAT
	STRING
	BOOLEAN
}

type Value {
	id: ID!
	name: String
	primitive: Primitive
	# validation: String
}

type Attribute {
	id: ID!
	name: String
	value: Value
}

type Entity {
	id: ID!
	name: String
	attributes(api: String!, query: String, skip: Int, limit: Int): [Attribute]
}

type Aggregate {
	id: ID!
	name: String
	root: String
	isCollection: Boolean
}

type Database {
	id: ID!
	name: String
	version: String
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
	addValue(api: String!, database: ID!, name: String!, primitive: Primitive!): Result
	addEntity(api: String!, database: ID!, name: String!): Result
	addAttribute(
		api: String!,
		database: ID!,
		entity: ID!,
		name: String!,
		type: Primitive
	): Result
}
`;
