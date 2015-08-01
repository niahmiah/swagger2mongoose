'use strict';
var DEBUG = false;

var apiDoc = require('./swagger.json');

var Swagger2Mongoose = require('../index');
var s2m = new Swagger2Mongoose({
  swaggerDoc: apiDoc,
  modelDir: 'test/api/models'
});
var should = require('chai').should();

describe('Swagger2Mongoose', function(){
  var Person;

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
      Person = s2m.getMongooseSchema('Person');
    }catch(e){
      console.log(e.stack);
      should.not.exist(e);
    }
    should.exist(Person);
  });
});
