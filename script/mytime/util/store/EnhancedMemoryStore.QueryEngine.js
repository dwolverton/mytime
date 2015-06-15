/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
/**
 * This can handle normal queries, and additional operators by suffixing they key with an operator. Supported ops:
 * { 'date': '2015-06-12' }  date equals 2015-06-12
 * { 'date!': '2015-06-12' }  date not equals 2015-06-12
 * { 'date<': '2015-06-12' }  date less than 2015-06-12
 * { 'date<=': '2015-06-12' }  date less or equal to 2015-06-12
 * { 'date>': '2015-06-12' }  date greater than 2015-06-12
 * { 'date>=': '2015-06-12' }  date greater or equal to 2015-06-12
 */
define(["lodash", "dojo/store/util/SimpleQueryEngine"],
function (_, SimpleQueryEngine) {
   return function(query, options) {
       if (!_.isObject(query)) {
           return SimpleQueryEngine(query, options);
       }

       var extraFunctions = [];

       var modifiedQuery = {};
       _.forEach(query, function(value, key) {
           var property;
           var lastChar = key[key.length - 1];
           if (lastChar === "<") {
               property = key.substring(0, key.length - 1);
               extraFunctions.push(function (object) {
                   return object[property] < value;
               });
           } else if (lastChar === ">") {
               property = key.substring(0, key.length - 1);
               extraFunctions.push(function(object) {
                   return object[property] > value;
               });
           } else if (lastChar === "=" && key[key.length - 2] === "<") {
               property = key.substring(0, key.length - 2);
               extraFunctions.push(function(object) {
                   return object[property] <= value;
               });
           } else if (lastChar === "=" && key[key.length - 2] === ">") {
               property = key.substring(0, key.length - 2);
               extraFunctions.push(function (object) {
                   return object[property] >= value;
               });
           } else if (lastChar === "!") {
               property = key.substring(0, key.length - 1);
               extraFunctions.push(function (object) {
                   return object[property] != value;
               });
           } else {
               modifiedQuery[key] = value;
           }
       });

       if (extraFunctions.length !== 0) {
           var standardFunction = SimpleQueryEngine(modifiedQuery, options);
           return function(array) {
               var array = _.filter(array, function(object) {
                   return _.all(extraFunctions, function(fn) {
                       return fn(object);
                   })
               });
               return standardFunction(array);
           }
       } else {
           return SimpleQueryEngine(query, options);
       }
   }
});