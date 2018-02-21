/* global define */
'use strict';

define([
	'-/api/classes/Domain/resolvers/add-repository.js',
	'-/api/classes/Domain/resolvers/add-entity.js',
	'-/api/classes/Domain/resolvers/upsert-attributes.js',
	'-/api/classes/Domain/resolvers/add-bounded-context.js',
	'-/api/classes/Domain/resolvers/add-aggregate.js',
	'-/api/classes/Domain/resolvers/upsert-queries.js',
	'-/api/classes/Domain/resolvers/upsert-mutations.js'
], (
	addRepository,
	addEntity,
	upsertAttributes,
	addBoundedContext,
	addAggregate,
	upsertQueries,
	upsertMutations
) => ({
	addRepository,
	addEntity,
	upsertAttributes,
	addBoundedContext,
	addAggregate,
	upsertQueries,
	upsertMutations
}));
