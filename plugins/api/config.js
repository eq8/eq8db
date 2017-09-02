'use strict';

module.exports = function config({ domain }) {
	return {
		id: domain,
		version: 0,
		boundedContexts: {
			admin: {
				aggregates: {
					domain: {
						root: 'Domain',
						tags: {
							latest: 'v0.0'
						},
						versions: {
							'v0.0': {
								queries: {},
								mutations: {
									addDomain: {
										parameters: {
											hostname: {
												type: 'STRING',
												required: true
											},
											webhook: {
												type: 'STRING'
											}
										}
									}
								}
							}
						}
					}
				}
			},
			model: {
				aggregates: {
					domain: {
						root: 'DomainModel'
					}
				}
			}
		},
		entities: {
			Domain: {
				name: 'STRING'
			},
			DomainModel: {
				name: 'STRING'
			}
		}
	};
};
