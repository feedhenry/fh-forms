# fh-forms 

FeedHenry Cloud API for form submissions.

## Installation
Install the projects dependencies:  

```
npm install
```

## Test execution

There are two types of tests: unit tests that don't have any additional dependencies and acceptance tests that require configured MongoDB. [Turbo](https://www.npmjs.com/package/turbo-test-runner) is used as a test runner. It stops test execution if a test fails.

We use `Grunt` to run the tests which needs to be installed:

```
npm install grunt -g
```

All the unit test with jshint:
 
```
grunt 
```

All unit tests:  

```
grunt fh:unit
```
All acceptance tests: 

```
grunt fh:accept
```

### Requirements to run acceptance tests

We need to install and configure [MongoDb](https://www.mongodb.org/). Installation instructions can be found in [MongoDb Docs](http://docs.mongodb.org). On Linux systems it is desirable to install *mongodb-org* meta package.

Make sure to have *mongod* up and running: `sudo /etc/init.d/mongod start`.

MongoDb can be controlled from mongo shell by typing `mongo`.

The last thing that we have to do is to add admin user via mongo shell:

```
use admin
db.createUser({
        user: "admin",
        pwd: "admin",
        roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})
```

## Code coverage

Code coverage reports are generated using [istanbul](http://gotwarlost.github.io/istanbul/) and stored in *coverage*, *cov-unit* and *cov-accept* folders.

Generate all code coverage:

```
grunt fh:coverage
```

Use 'fh:coverage:unit_cover' or 'fh_coverage:accept_cover' instead of 'coverage' to generate individual reports.


