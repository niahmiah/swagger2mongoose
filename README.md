# Swagger 2 Mongoose

[![Greenkeeper badge](https://badges.greenkeeper.io/niahmiah/swagger2mongoose.svg)](https://greenkeeper.io/)

Dynamically generate mongoose schemas for your REST API, using your Swagger JSON.

See http://swagger.io




### Use

```
npm install swagger2mongoose
mkdir -p api/models
touch api/models/people.js
```

```
var mongoose = require('mongoose');
var swaggerDoc = require('./swagger.json');

var s2m = new Swagger2Mongoose({
  swaggerDoc: swaggerDoc,
  modelDir: 'api/models'
});

var options = {
  _id: false,
  collection: 'people'
}

var Schema = s2m.getMongooseSchema('People', options);

// decorate the Schema with methods before converting to a model
Schema.methods.lastSeen = function lastSeen(callback){
  this.lastSeen = new Date();
  this.save(callback);
}

var Model = mongoose.model('People', Schema);
```

### Options

*swaggerDoc* - The object containing the Swagger JSON

*modelDir* - The path to your models. The directory is checked for *.js files matching the name of the schema definitions in the Swagger JSON. The existence of model file in this directory signifies that a schema is a top level schema and not an embedded schema.


### Why

This can be used to generate mongoose schemas for your application, so that you have an extra level of validation in your application besides tools such as swagger-tools validator middleware that validate incoming requests and responses.


### Known issues

- Not all validations are enabled. Min, Max, Required, etc may not be enforced.
