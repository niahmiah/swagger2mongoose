'use strict';
var fs = require('fs');
var changeCase = require('change-case');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


function Swagger2Mongoose(options){
  this.swagger = options.swaggerDoc;
  this.modelDir = options.modelDir;
  this.topLevelSchemas = [];
  if(this.swagger){
    var arr = [];
    var schemasRaw = this.swagger.definitions;
    var modelFiles = fs.readdirSync(this.modelDir);
    for(var i = 0; i < modelFiles.length; i++){
      var modelFileName = modelFiles[i].replace(/\.js$/, '');
      for(var key in schemasRaw){
        if(modelFileName === changeCase.lowerCaseFirst(key)){
          arr.push(key);
        }
      }
    }
    this.topLevelSchemas = arr;
  }
}

function iterateOverObject(object, mongooseSchemaObject){
  var required = object.required || [];
  for(var key in object.properties){
    if(key !== 'schema'){
      mongooseSchemaObject[key] = {}; // defaults to Mixed
      var field = object.properties[key];

      if(field.type === 'string' && field.format === 'date-time'){
        mongooseSchemaObject[key].type = Date;
      }else if(field.type === 'string'){
        mongooseSchemaObject[key].type = String;
      }else if(field.type === 'integer'){
        mongooseSchemaObject[key].type = Number;
      }

      if(field.type === 'array' && field.items){
        if(field.items.type === 'string' && field.items.format === 'date-time'){
          mongooseSchemaObject[key].type = [Date];
        }else if(field.items.type === 'string'){
          mongooseSchemaObject[key].type = [String];
        }else if(field.items.type === 'integer'){
          mongooseSchemaObject[key].type = [Number];
        }
        if(field.items.enum){
          mongooseSchemaObject[key].validate = function(v){
            return v.every(function (val) {
              return !!~field.items.enum.indexOf(val);
            });
          };
        }
      }

      if(field.type === 'object' && field.properties){
        iterateOverObject(field, mongooseSchemaObject);
      }

      if(field.enum){
        mongooseSchemaObject[key].enum = field.enum;
      }

      if(field.$ref){
        var refSchemaName = field.$ref.replace('#/definitions/', '');
        if(self.topLevelSchemas.indexOf(refSchemaName) >= 0){
          mongooseSchemaObject[key].type = Schema.Types.ObjectId;
          mongooseSchemaObject[key].ref = refSchemaName;
        }else{
          mongooseSchemaObject[key].type = self.getMongooseSchemaObject(refSchemaName);
        }
      }

      if(field.type !== 'object' && mongooseSchemaObject[key].type && required.indexOf(key) >= 0){
        mongooseSchemaObject[key].required = true;
      }
    }
  }
}

Swagger2Mongoose.prototype.getMongooseSchemaObject = function(name){
  var self = this;
  var jsonSchemas = self.swagger.definitions;
  var mongooseSchemaObject = {};
  if(!jsonSchemas[name]) throw new Error('Swagger definitions missing: ' + name + ' in ' + JSON.stringify(Object.keys(jsonSchemas)));
  iterateOverObject(jsonSchemas[name], mongooseSchemaObject);
  return mongooseSchemaObject;
};

Swagger2Mongoose.prototype.getMongooseSchema = function(name, collection){
  var self = this;
  var mongooseSchemaObject = self.getMongooseSchemaObject(name);
  return new Schema(mongooseSchemaObject, {collection: collection});
};

module.exports = Swagger2Mongoose;
