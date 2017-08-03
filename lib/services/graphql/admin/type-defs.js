'use strict';

module.exports = `
enum Primitive {
	ID
	INT
	FLOAT
	STRING
	BOOLEAN
}

enum ObjectType {
	VALUE
	ENTITY
}

type Attribute {
	id: ID!
	name: String
	primitive: Primitive
	objectType: ObjectType
	isCollection: Boolean
}

type Value {
	id: ID!
	name: String
	# validation: Validation
	attributes: [Attribute]
}

type Entity {
	id: ID!
	name: String
	attributes: [Attribute]
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

input AttributeInput {
		name: String!,
		primitive: Primitive!,
		objectType: ObjectType,
		isCollection: Boolean
}

type Mutation {
	addAggregate(name: String!): Result
	addValue(name: String!, attributes: [AttributeInput]): Result
	addEntity(name: String!, attributes: [AttributeInput]): Result
}
`;
