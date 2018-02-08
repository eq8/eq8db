/* global define */
'use strict';

define([
	'-/api/classes/Domain/resolvers/add-repository.js',
	'-/api/classes/Domain/resolvers/add-entity.js',
	'-/api/classes/Domain/resolvers/add-properties.js',
	'-/api/classes/Domain/resolvers/add-bounded-context.js',
	'-/api/classes/Domain/resolvers/add-aggregate.js',
	'-/api/classes/Domain/resolvers/add-queries.js',
	'-/api/classes/Domain/resolvers/add-mutations.js'
], (
	addRepository,
	addEntity,
	addProperties,
	addBoundedContext,
	addAggregate,
	addQueries,
	addMutations
) => ({
	addRepository,
	addEntity,
	addProperties,
	addBoundedContext,
	addAggregate,
	addQueries,
	addMutations
}));
