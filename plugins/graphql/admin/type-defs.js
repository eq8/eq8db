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

type Domain {
	aggregates(query: String, skip: Int, limit: Int): [Aggregate]
	entities(query: String, skip: Int, limit: Int): [Entity]
}

type Query {
	domain: Domain
}

type Result {
	code: String!
	description: String
}

type Transaction {
	id: ID!
	addBoundaryContext(name: String!): Transaction
	addAggregate(boundaryContext: String!, name: String!): Transaction
	addEntity(name: String!): Transaction
	addAttribute(entity: String!, name: String!, value: Value, isCollection: Boolean): Transaction
	addQuery(boundaryContext: String!, aggregate: String!, name: String!, value: Value, isCollection: Boolean): Transaction
	addMutation(boundaryContext: String!, aggregate: String!, name: String!): Transaction
	commit: Result
}

type Mutation {
	transact: Transaction
}
`;
