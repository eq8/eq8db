# Microservices Viable Platform (@eq8/mvp)

[![Greenkeeper badge](https://badges.greenkeeper.io/eq8/mvp.svg)](https://greenkeeper.io/)

**EXPERIMENTAL**: Not yet ready to be released

## Overview

Summarize the project and link to external documents.

- Give context by pointing the product specs, marketing documents, and engineering documents.
- Summarize the general approach.
- Give a rough overall time estimate (project size).

## Background

Contextualize your project: why build it? What is the motivation? What user problems are you attempting to solve? What previous efforts, if any, have been made to solve this problem?

## Goals and Product Requirements

These sections are optional if a product spec has already clearly defined the project goals and requirements; but if not, defining these will be the most important area of your spec.

The cornerstone of all successful projects is having clear goals — knowing what problem we’re solving. I cannot over-state the importance of agreeing on the goal; the biggest failures I’ve witnessed were due to various stakeholders running off in different directions because they didn’t take the time to make sure everyone really agreed about what they were supposed to do.

## Assumptions

This is an engineering-centric bullet list that digests the product requirements as technical behaviors and limitations. It tells external stakeholders precisely what you will build and how much your system can handle. Be specific, detailed, and nerdy. Define SLAs, capacity, and failure tolerances.

## Out of Scope

This is a counterpart to “assumptions”, but written in the negative. It’s a bullet list of what’s off the table, in particular features that aren’t included and internal process that you won’t own. Spend a lot of time on this list, it’s your opportunity to prevent unwanted work and misunderstandings!

## Open Questions

As you write your tech spec, don’t stop to fill in all holes and TBD items. Just list them in the “Open Questions” section and keep going.

## Approach

Describe your solution in whatever level of detail is appropriate for you and your audience. Each subsystem, new technology choice, standard, etc. should have its own sub-section. You should also describe what other options you considered; or put this in a section “Other Options Considered.”

## Components

This is optional, but recommended. Here, you give a recap of your proposed approach in an easy-to-read bullet list format that enumerates all the systems that will be changed or created.

## Schema Changes

List all data storage changes, no matter how minor. You can go as deep as providing complete schemas or UML diagrams, but I’ve found this level of detail can derail early conversations. What matters most is agreeing at a high level about the kind of data you’ll be storing, how much, and how relational it should be — you can work through the specifics later.

## Security, Privacy, Risks

It’s always a good idea to think about customer data protection, personal information, encryption, vectors of attack, etc, no matter how small a project may seem. Always include this section so people know you’ve thought about this, even if you just say “There should be no security or privacy concerns here.”

## Test Plan

Describe the testing strategy, both within your engineering team(unit and integration tests) and for QA (manual test plan and automated test suites). Give the QA team as much of a heads-up as possible.

## Deployment and Rollout

Consider the logistics and order of operations for go-live; and for subsequent releases. Discuss configuration management, secrets management, database changes, migrations, and your sign-off process.

## Rollback Plan

Explain what happens if something goes wrong with the deployment — if there’s a failed integration, or if customers hate a feature. What metrics and alerts should we watch? Is it possible to move backwards and restore our previous system? How?

## Monitoring and Logging

Show how we’ll know we’ll know if there are problems in our software, how we can track our SLAs, know if the system is healthy, and be able to search through logs to track down bugs or customer issues.

## Metrics

Show how we’ll be able to answer business-level questions about the benefits and impact of a feature.

## Long-term Support

Consider questions like: who owns maintaining this software going forward? What are the long-term costs and “gotchas”? What happens if key people leave and we need to transfer knowledge?

## Timeline and Components

Give a rough task break-down, by owner, in day-sized estimates (e.g. “The compliance engineering team creates widget X: ~3 person-days”). Be realistic; use actual person-calendar-days and not theoretical “if we were 100% focused…” estimates; and include padding for integrations, risks, and meetings. Account for tasks required for all teams, not just your own.

