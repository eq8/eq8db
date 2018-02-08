/* global define */
'use strict';

define([
	'lodash',
	'passport',
	'passport-jwt',
	'passport-anonymous'
], (
	_,
	passport,
	{ Strategy: JWTStrategy, ExtractJwt },
	{ Strategy: AnonymousStrategy }
) => {
	const plugin = {
		initialize,
		authenticate: passport.authenticate(['jwt', 'anonymous'], { session: false })
	};

	function initialize(options) {
		const { jwt: JWTSettings } = _.defaultsDeep(options, {
			jwt: {
				secretOrKey: process.env.MVP_AUTHENTICATION_SECRET,
				algorithms: ['HS256'],
				jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
				verifyCallback: (payload, done) => done(null, payload)
			}
		});

		passport.use(new JWTStrategy(JWTSettings, JWTSettings.verifyCallback));
		passport.use(new AnonymousStrategy());

		return passport.initialize();
	}

	return plugin;
});
