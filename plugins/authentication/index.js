/* global define */
'use strict';

define([
	'lodash',
	'passport',
	'jwks-rsa',
	'jsonwebtoken',
	'passport-jwt',
	'passport-anonymous'
], (
	_,
	passport,
	jwksRsa,
	passportJwt,
	{ Strategy: JwtStrategy, ExtractJwt },
	{ Strategy: AnonymousStrategy }
) => {
	const plugin = {
		initialize,
		authenticate
	};

	function initialize(options) {
		const { jwt } = options || {};

		passport.use(getJwtStrategy(jwt));
		passport.use(new AnonymousStrategy());

		return passport.initialize();
	}

	function getJwtStrategy(options) {
		const defaults = {
			secretOrKeyProvider,
			algorithms: ['RS256'],
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			verifyCallback: (payload, done) => done(null, payload)
		};
		const settings = _.defaultsDeep(options, defaults);

		return new JwtStrategy(settings, settings.verifyCallback);
	}

	function secretOrKeyProvider(req, rawJwtToken, cb) {
		const { header } = passportJwt.decode(rawJwtToken, { complete: true }) || {};

		const client = jwksRsa({
			cache: true,
			rateLimit: true,
			jwksRequestsPerMinute: 5,
			jwksUri: process.MVP_AUTHENTICATION_JWKS_URI
		});

		const notRSA = !header || header.alg !== 'RS256';

		if (notRSA) {
			return cb(null, null);
		}

		const handler = getSigningKeyCallback(cb);

		return client.getSigningKey(header.kid, handler);
	}

	function getSigningKeyCallback(cb) {
		return (err, key) => cb(null, (err || !key) ? null : (key.publicKey || key.rsaPublicKey));
	}

	function authenticate() {
		const strategies = ['jwt', 'anonymous'];

		return passport.authenticate(strategies, { session: false });
	}

	return plugin;
});
