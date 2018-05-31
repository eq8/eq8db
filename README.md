# Microservices Viable Platform (@eq8/mvp)

[![Greenkeeper badge](https://badges.greenkeeper.io/eq8/mvp.svg)](https://greenkeeper.io/)

**EXPERIMENTAL**: Not yet ready to be released

A scalable and extensible platform for multi-tenant web based enterprise applications

https://eq8.js.org/mvp

## Development

### Requirements

- Docker
- Docker Compose
- Node

### Run

```
git clone https://github.com/eq8/mvp.git
cd mvp
npm install
npm start
```

#### Example REPL calls

```
api
	.domain({id: 'localhost:8000'})
	.addAggregate({bctxt: 'bctxt', name: 'aggregate', schemaVersion: '0.0'})
	.commit()
	.then(console.log, console.error);

api
	.domain({id: 'localhost:8000'})
	.upsertQueries({bctxt: 'bctxt', aggregate: 'aggregate', queries: {query: {type: 'Entity'}}})
	.commit()
	.then(console.log, console.error);
```

