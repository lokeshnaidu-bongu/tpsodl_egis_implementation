 /*
  ff() 'Find Function' is a development function to use in the browser console to
  search for API functions and properties.

  ff(<function or property name>, <module name>)
  The supplied names can be patial names and are case independent.
  A space in the search strings is the equivalent to a wildcard *.

  Matching results are output to the console and clicking on a function will
  open the source in the browser's Dev Tools.
  (In Chrome: I suggest adding a workspace to map C:\projects\hg\network_viewer)

  The function can be loaded in the console using the following:
  s = document.createElement('script'); s.src = 'dev_scripts/ff.js'; document.head.appendChild(s)

  Examples of use:
  ff("get control")
  ff("get control", "test")
  ff("select", "sketching")
*/
window.ff = function( propertyName, moduleName, max ) {

  var startTime = new Date(),
    allModules = require.s.contexts._.defined,
    paths = require.s.contexts._.config.paths,
    count = {number: 0},
    results = [],
    nameLength = 0,
    objLength = 0,
    propertyTest,
    moduleTest,
    res,
    i,
    len,
    name,
    objName,
    nLength,
    spaces,
    dots,
    value,
    returnIndex;

  if (max === undefined) {
    max = 20;
  };

  propertyTest = getTestString(propertyName);
  moduleTest = getTestString(moduleName);

  if (propertyTest === undefined && moduleTest === undefined) {
    return;
  };

  addFindResults(propertyTest, moduleTest, results, allModules, "", count, max, 1);

  len = results.length;

  for (i = 0; i < len; i++) {
    res = results[ i ];
    name = res.name;
    objName = res.objectName;

    /*
    path = paths[ objName.split(".")[0] ];
    if (path === undefined) {
      path = paths[ objName.split("/")[0] ];
    };
    res.path = path || "";
    */

    nameLength = Math.max(nameLength, name.length);
    objLength = Math.max(objLength, objName.length);
  };

  results.sort( function(a, b) {
    if (a.sortName < b.sortName) {
      return -1;
    } else if (a.sortName > b.sortName) {
      return 1;
    } else if (a.sortObjectName < b.sortObjectName) {
      return -1;
    } else if (a.sortObjectName > b.sortObjectName) {
      return 1;
    } else {
      return 0;
    }
  });

  nLength = Math.max(results.length, max).toString().length;

  for (i = 0; i < len; i++) {
    res = results[ i ];
    name = res.name;
    objName = res.objectName;
    //path = res.path;

    if (i > 8 || len < 10) {
      spaces = " ";
    } else {
      spaces = "  ";
    };

    if (nameLength < 31) {
      dots = " " + ".".repeat(nameLength - name.length + 3) + " ";
    } else {
      dots = " ... ";
    }

    console.log( "%c[" + (i + 1) + "]" + spaces + "%c" + name + "%c" + dots + "%c" + objName,
    "color: #00868b", "color: #0000ff", "color: #a0a0a0", "color: #008000" );

    /*
    if (path.length !== 0) {
      console.log( " ".repeat(nLength + 4) + "(" + path + ")" );
    };
    */

    value = res.value;
    if (typeof value === "string" || value instanceof String) {
      returnIndex = value.indexOf("\n");
      if (returnIndex > 0) {
        console.log( value.slice(0, Math.min(returnIndex, 80)) + " .." );
      } else if (value.length > 80) {
        console.log( value.slice(0, 80) + ".." );
      } else {
        console.log( value.toString() );
      }
    } else {
      console.log( "%o", value );
    };
  };

  if (count.number > max) {
    console.log("...");
  };
  console.log("");
  var time = new Date() - startTime;
  return count.number + " results found in " + time + " ms";
};


var addFindResults = function addFindResults(propertyTest, moduleTest, results, obj, objName, count, max, depth) {
  var properties = getAllProperties(obj),
    l = properties.length,
    property,
    value,
    name,
    i;

  for (i = 0; i < l; i++) {
    property = properties[i];

    try {
      value = obj[ property ];
    } catch (err) {};

    if (depth > 1) {
      checkValue(propertyTest, moduleTest, results, obj, objName, count, max, property, value);
    };

    if (depth < 5 &&
      property[0] !== "<" &&
      value instanceof Object &&
      !(value instanceof Array) &&
      obj.hasOwnProperty(property)) {

      if (value.CLASS_NAME !== undefined) {
        name = value.CLASS_NAME;
      } else if (objName == "") {
        name = property;
      } else if (property == "prototype" || property == "initialize") {
        name = objName;
      } else {
        name = objName + "." + property;
      };

      /*
      if (!checked.includes(name)) {
        checked.push( name );
        if (Object.keys(value).length == 0) {
          value = value.prototype;
          if (value === undefined) {
            continue;
          };
        };
        addFindResults(propertyTest, moduleTest, checked, results, value, name, count, max, depth + 1);
      };
      */
      addFindResults(propertyTest, moduleTest, results, value, name, count, max, depth + 1);
    };
  };
};


var getTestString = function getTestString(str) {
  var testStr = undefined;
  if (str === undefined || str === null || str.length == 0) {
    return testStr;
  } else {
    testStr = str.replace("*", " ");
    testStr = testStr.replace(" ", "[a-z0-9_$.]*");
    testStr = new RegExp(testStr, "i");
    return testStr;
  };
};


var getAllProperties = function getAllProperties(obj) {
  var curr = obj,
    allProps = Object.getOwnPropertyNames(obj),
    prototypes = [],
    i = 1,
    n,
    end,
    props;

  do {
   prototypes.push(curr);
  } while(curr = Object.getPrototypeOf(curr));

  n = prototypes.length;
  if (n == 1) {
   return [];
  };

  end = n - 1;
  for(; i < end; i++) {
    props = Object.getOwnPropertyNames( prototypes[i] );
    props.forEach( function(prop) {
      if (allProps.indexOf(prop) === -1) {
        allProps.push(prop);
      };
    });
  };

  return allProps;
};


var checkValue = function checkValue(propertyTest, moduleTest, results, obj, objName, count, max, property, value) {
  var funcName,
    funcTest;

  if (moduleTest === undefined || moduleTest.test(objName)) {
    if (_.isFunction(value)) {
      funcName = value.name;
      if (funcName == "") {
        funcName = property;
      };
      funcTest = new RegExp(funcName);
      if (!funcTest.test(objName) &&
        (propertyTest === undefined || propertyTest.test(funcName)) &&
        checkFunction(results, value)) {
        if (results.length < max) {
          results.push({
            object: obj,
            value: value,
            name: funcName + "()",
            objectName: objName,
            sortName: funcName.toLowerCase(),
            sortObjectName: objName.toLowerCase()
          });
        };
        count.number++;
      };
    } else if (propertyTest === undefined || propertyTest.test(property)) {
      if (results.length < max && property[0] !== "<") {
        results.push({
          object: obj,
          value: value,
          name: property,
          objectName: objName,
          sortName: property.toLowerCase(),
          sortObjectName: objName.toLowerCase()
        });
      };
      count.number++;
    };
  };
};


var checkFunction = function checkFunction(results, func) {
  var i = 0,
    n = results.length;
  for (; i < n; i++) {
    if (results[i].value === func) {
      return false;
    };
  };
  return true;
};
