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
	jwt,
	{ Strategy: JWTStrategy, ExtractJwt },
	{ Strategy: AnonymousStrategy }
) => {
	const plugin = {
		initialize,
		authenticate
	};

	function initialize(options) {
		passport.use(getJWTStrategy(options));
		passport.use(new AnonymousStrategy());

		return passport.initialize();
	}

	function getJWTStrategy(options) {
		const { jwt: JWTSettings } = _.defaultsDeep(options, {
			jwt: {
				secretOrKeyProvider,
				algorithms: ['RS256'],
				jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
				verifyCallback: (payload, done) => done(null, payload)
			}
		});

		return new JWTStrategy(JWTSettings, JWTSettings.verifyCallback);
	}

	function secretOrKeyProvider(req, rawJwtToken, cb) {
		const { header } = jwt.decode(rawJwtToken, { complete: true }) || {};

		const client = jwksRsa({
			cache: true,
			rateLimit: true,
			jwksRequestsPerMinute: 5,
			jwksUri: 'https://bbartolome.auth0.com/.well-known/jwks.json'
		});

		if (!header || header.alg !== 'RS256') {
			return cb(null, null);
		}

		return client.getSigningKey(header.kid, (err, key) => {
			if (err) {
				return cb(err, null);
			}

			return cb(null, key.publicKey || key.rsaPublicKey);
		});
	}

	function authenticate() {
		const strategies = ['jwt', 'anonymous'];

		return passport.authenticate(strategies, { session: false });
	}

	return plugin;
});
