/* global define */
'use strict';

define([
	'-/api/domain/resolvers/add-repository.js',
	'-/api/domain/resolvers/add-entity.js',
	'-/api/domain/resolvers/upsert-attributes.js',
	'-/api/domain/resolvers/add-bounded-context.js',
	'-/api/domain/resolvers/add-aggregate.js',
	'-/api/domain/resolvers/upsert-queries.js'
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
