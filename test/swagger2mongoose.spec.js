'use strict';
var DEBUG = true;

var apiDoc = require('./swagger.json');

var Swagger2Mongoose = require('../index');
var s2m = new Swagger2Mongoose({
  swaggerDoc: apiDoc,
  modelDir: 'test/api/models'
});
var should = require('chai').should();

describe('Swagger2Mongoose', function(){
  var schemas = {};

  after(function(){
    if(DEBUG){
      for(var schema in schemas){
        console.log('\n' + schema + ' Tree', schemas[schema].tree);
        console.log('\n' + schema + ' Paths', schemas[schema].paths);
      }
    }
  });

  it('should create valid mongoose schemas', function itCb(){
    try{
      schemas.Pet = s2m.getMongooseSchema('Pet');
      schemas.User = s2m.getMongooseSchema('User');
      schemas.Order = s2m.getMongooseSchema('Order');
    }catch(e){
      console.log(e.stack);
      should.not.exist(e);
    }
    should.exist(schemas.Pet);
  });
});
