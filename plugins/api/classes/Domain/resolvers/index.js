/* global define */
'use strict';

define([
	'-/api/classes/domain/resolvers/add-repository.js',
	'-/api/classes/domain/resolvers/add-entity.js',
	'-/api/classes/domain/resolvers/upsert-attributes.js',
	'-/api/classes/domain/resolvers/add-bounded-context.js',
	'-/api/classes/domain/resolvers/add-aggregate.js',
	'-/api/classes/domain/resolvers/upsert-queries.js'
], (
	addRepository,
	addEntity,
	upsertAttributes,
	addBoundedContext,
	addAggregate,
	upsertQueries
) => ({
	addRepository,
	addEntity,
	upsertAttributes,
	addBoundedContext,
	addAggregate,
	upsertQueries
}));
