'use strict';

var fs = require('fs');
var changeCase = require('change-case');

function getTopLevelSchemas(swaggerDoc, modelDir){
  var arr = [];
  if(swaggerDoc && modelDir){
    var schemasRaw = swaggerDoc.definitions;
    var modelFiles = fs.readdirSync(modelDir);
    for(var i = 0; i < modelFiles.length; i++){
      var modelFileName = modelFiles[i].replace(/\.js$/, '');
      for(var key in schemasRaw){
        if(modelFileName === changeCase.lowerCaseFirst(key)){
          arr.push(key);
        }
      }
    }
  }
  return arr;
}

function buildEmptySchemaObject(swaggerDoc){
  var schemas = {};
  for(var schema in swaggerDoc.definitions){
    schemas[schema] = {};
  }
  return schemas;
}

function getDataType(field, existingSchemas){
  if(!field) return;
  var dataType;
  // handle strings
  if(field.type === 'string' && field.format === 'date-time'){
    dataType = Date;
  }else if(field.type === 'string'){
    dataType = String;
  }
  // handle integers
  if(field.type === 'integer' || field.type === 'number'){
    dataType = Number;
  }
  // handle boolean
  if(field.type === 'boolean'){
    dataType = Boolean;
  }
  // handle object
  if(field.$ref){
    var refSchemaName = field.$ref.replace('#/definitions/', '');
    dataType = existingSchemas[refSchemaName];
  }
  return dataType;
}

function getType(field, existingSchemas){
  var o = {};
  if(field.$ref){
    o = getDataType(field, existingSchemas);
  }else if(field.type === 'object' && field.properties){
    o = objectFromProperties(field, existingSchemas);
  }else if(!field.type || field.type !== 'array'){
    o.type = getDataType(field, existingSchemas);
    if(field.enum){
      o.enum = field.enum;
    }
  }else{
    // this is an array
    o.type = [getDataType(field.items, existingSchemas)];
  }

  return o;
}

function objectFromProperties(object, existingSchemas){
  var o = {};
  var requiredFields = object.required || [];
  for(var key in object.properties){
    if(key !== 'schema'){
      var field = object.properties[key];
      o[key] = getType(field, existingSchemas, requiredFields);
      if(field.type !== 'object' && o[key] && o[key].type && requiredFields.indexOf(key) >= 0){
        o[key].required = true;
      }
    }
  }
  return o;
}

function buildSchemaObject(swaggerDoc, existingSchemas){
  var schemas = {};
  for(var schema in swaggerDoc.definitions){
    schemas[schema] = objectFromProperties(swaggerDoc.definitions[schema], existingSchemas);
  }
  return schemas;
}

module.exports = {
  getTopLevelSchemas: getTopLevelSchemas,
  buildEmptySchemaObject: buildEmptySchemaObject,
  buildSchemaObject: buildSchemaObject
};
