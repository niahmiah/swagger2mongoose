'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var helpers = require('./lib/helpers');

function Swagger2Mongoose(options){
  this.swaggerDoc = options.swaggerDoc;
  this.modelDir = options.modelDir;
  // top level schemas are the ones represented by a file in the model dir
  this.topLevelSchemas = helpers.getTopLevelSchemas(this.swaggerDoc, this.modelDir);
  // do a first pass to simply create empty objects for each schema, so that references will already be defined
  this.schemas = helpers.buildEmptySchemaObject(this.swaggerDoc);
  // then actually  build them
  this.schemas = helpers.buildSchemaObject(this.swaggerDoc, this.schemas);
  // do it once more to enable sub-schemas
  this.schemas = helpers.buildSchemaObject(this.swaggerDoc, this.schemas);
}

Swagger2Mongoose.prototype.getMongooseSchema = function getMongooseSchema(name, collection){
  if(!this.schemas[name]) throw new Error('Swagger definitions missing: ' + name + ' in ' + JSON.stringify(Object.keys(this.schemas)));
  var options = {};
  if (collection) { options.collection = collection; }
  var s = this.schemas[name];
  return new Schema(s, options);
};

module.exports = Swagger2Mongoose;
