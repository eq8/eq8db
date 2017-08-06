'use strict';

module.exports = `
enum Value {
	INT
	FLOAT
	STRING
	BOOLEAN
	ENTITY
	# Extend - e.g. DATE, CURRENCY, etc.
}

type Attribute {
	id: ID!
	name: String
	isCollection: Boolean
	value: Value
}

type Entity {
	id: ID!
	name: String
	attributes: [Attribute]
}

type Aggregate {
	id: ID!
	description: String
}

type Query {
	aggregates(query: String, skip: Int, limit: Int): [Aggregate]
	entities(query: String, skip: Int, limit: Int): [Entity]
}

type Result {
	code: String!
	description: String
}

input AttributeInput {
	name: String!,
	isCollection: Boolean
	value: Value
}

type Transaction {
	id: ID!
	addEntity(name: String!, attributes: [AttributeInput]): Result
	addAggregate(name: String!, root: ID!): Result
}

type Mutation {
	begin: Transaction
}
`;
