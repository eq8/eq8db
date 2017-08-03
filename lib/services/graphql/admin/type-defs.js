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
	id: ID!
	name: String
	primitive: Primitive
	# validation: Validation
}

type Attribute {
	id: ID!
	name: String
	value: Value
}

type Entity {
	id: ID!
	name: String
	attributes(query: String, skip: Int, limit: Int): [Attribute]
}

type Aggregate {
	id: ID!
	name: String
	root: ID
	isCollection: Boolean
}

type Result {
	code: String!
	description: String
}

type Query {
	aggregates(query: String, skip: Int, limit: Int): [Aggregate]
	entities(query: String, skip: Int, limit: Int): [Entity]
	values(query: String, skip: Int, limit: Int): [Value]
}

type Mutation {
	addAggregate(name: String!): Result
	addValue(name: String!, primitive: Primitive!): Result
	addEntity(name: String!): Result
	addAttribute(
		api: String!,
		database: ID!,
		entity: ID!,
		name: String!,
		value: ID!
	): Result
}
`;
