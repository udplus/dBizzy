document.addEventListener('DOMContentLoaded', () => {
  // Declare constants to refer to HTML elements
  const body = document.querySelector('body');
  // const exportButton = document.querySelector('#exportButton');
  // Create button for exporting ER diagrams, prepend to body
  // const exportButton = document.createElement('button');
  // exportButton.setAttribute('id', 'exportButton')
  // exportButton.innerText = 'Export Diagram';
  // body.prepend(exportButton);

  // Create button for updating ER diagrams, prepend to body
  const parseButton = document.createElement('button');
  parseButton.setAttribute('id', 'sqlParseButton');
  parseButton.innerText = 'Update Diagrams';
  body.prepend(parseButton);

  // Create textarea for SQL Query Set to read-only since we expect users to be reading from a file
  // Prepend textarea to body
  const sqlInput = document.createElement('textarea');
  sqlInput.setAttribute('id', 'sqlInput');
  sqlInput.setAttribute('readonly', 'true');
  sqlInput.style.display = 'none';
  sqlInput.style.height = '200px';
  sqlInput.style.width = '100%';
  sqlInput.value = 'CREATE TABLE Persons\n(\nPersonID int PRIMARY KEY,\nLastName varchar(255),\n' +
    'FirstName varchar(255),\nAddress varchar(255),\nCity varchar(255)\n);';
  body.prepend(sqlInput);

  function handleZoom(e) {
    d3.select('svg g')
      .attr('transform', e.transform);
  }
  let zoom = d3.zoom()
  .on('zoom', handleZoom);
  // Declare various model classes
  function TableModel() {
    this.Name = null;
    this.Properties = []
  }

  function PropertyModel() {
    this.Name = null;
    this.Value = null;
    this.TableName = null;
    this.References = [];
    this.IsPrimaryKey = false;
    this.IsForeignKey = false;
  }

  function ForeignKeyModel() {
    this.PrimaryKeyName = null;
    this.ReferencesPropertyName = null

    this.PrimaryKeyTableName = null;
    this.ReferencesTableName = null;

    this.IsDestination = false;
  }

  function PrimaryKeyModel() {
    this.PrimaryKeyName = null;
    this.PrimaryKeyTableName = null;
  }

  // Creating global empty arrays to hold foreign keys, primary keys, and tableList
  let foreignKeyList = [];
  let primaryKeyList = [];
  let tableList = [];

  // Parses foreign key with SQL Server syntax
  function ParseSQLServerForeignKey(name, currentTableModel, propertyType) {
    // Regex expression to find referenced foreign table 
    const referencesIndex = name.match(/(?<=REFERENCES\s)([a-zA-Z_]+)(\([a-zA-Z_]*\))/);
    const referencedTableName = referencesIndex[1];
    const referencedPropertyName = referencesIndex[2].replace(/\(|\)/g, '');

    // Remove everything after 'foreign key' from line
    const foreignKeyLabelIndex = name.toLowerCase().indexOf('foreign key');
    let foreignKey = name.slice(0, foreignKeyLabelIndex).trim();
    
    // If 'primary key' exists in line, remove 'primary key'
    const primaryKeyLabelIndex = name.toLowerCase().indexOf('primary key');
    if (primaryKeyLabelIndex >= 0) {
      foreignKey = foreignKey.slice(0, primaryKeyLabelIndex).trim();
    };

    if (referencesIndex !== -1) {

      //Create ForeignKey with IsDestination = false
      const foreignKeyOriginModel = CreateForeignKey(foreignKey, currentTableModel.Name, referencedPropertyName, referencedTableName, false);

      //Add ForeignKey Origin
      foreignKeyList.push(foreignKeyOriginModel);

      //Create ForeignKey with IsDestination = true
      const foreignKeyDestinationModel = CreateForeignKey(referencedPropertyName, referencedTableName, foreignKey, currentTableModel.Name, true);

      //Add ForeignKey Destination
      foreignKeyList.push(foreignKeyDestinationModel);

      //Create Property
      const propertyModel = CreateProperty(foreignKey, currentTableModel.Name, null, false);

      // If property is both primary key and foreign key, set IsPrimaryKey property to true
      if (propertyType === 'SQLServer both') {
        propertyModel.IsPrimaryKey = true;
      }

      //Add Property to table
      currentTableModel.Properties.push(propertyModel);
    }
  };
  
  function ParseMySQLForeignKey(name, currentTableModel) {
    // Parsing Foreign Key from MySQL syntax
    name = name.replace(/\"/g, '');

    let foreignKeyName = name.match(/(?<=FOREIGN\sKEY\s)(\([a-zA-Z_]+\))(?=\sREFERENCES\s)/)[0].replace(/\(|\)/g, '');
    const referencedTableName = name.match(/(?<=REFERENCES\s)([a-zA-Z_]+)(?=\()/)[0];
    const referencedPropertyName = name.match(/(?<=REFERENCES\s[a-zA-Z_]+)(\([a-zA-Z_]+\))/)[0].replace(/\(|\)/g, '');

    // Look through current table and reassign isForeignKey prop to true, reassign foreignKeyName to include type
    currentTableModel.Properties.forEach(property => {
      if (property.Name.split(' ')[0] === foreignKeyName) {
        property.IsForeignKey = true;
        foreignKeyName = property.Name;
      }
    })

    // Create ForeignKey
    const foreignKeyOriginModel = CreateForeignKey(foreignKeyName, currentTableModel.Name, referencedPropertyName, referencedTableName, false);

    // Add ForeignKey Origin
    foreignKeyList.push(foreignKeyOriginModel);

    // Create ForeignKey
    const foreignKeyDestinationModel = CreateForeignKey(referencedPropertyName, referencedTableName, foreignKeyName, currentTableModel.Name, true);

    // Add ForeignKey Destination
    foreignKeyList.push(foreignKeyDestinationModel);
  }

  // Iterates through primaryKeyList and checks every property in every table
  // If primaryKeyList.Name === propertyModel.Name, set IsPrimaryKey property to true
  function ProcessPrimaryKey() {
    primaryKeyList.forEach(function (primaryModel) {
      tableList.forEach(function (tableModel) {
        if (tableModel.Name === primaryModel.PrimaryKeyTableName) {
          tableModel.Properties.forEach(function (propertyModel) {
            if (propertyModel.Name === primaryModel.PrimaryKeyName) {
              propertyModel.IsPrimaryKey = true;
            }
          });
        }
      });
    });
  }

  // Iterates through foreignKeyList and checks every property in every table
  // If propertyModel's name equals what the foreignKeyModel is referencing, set propertyModel.IsForeignKey to true and add foreignKeyModel to propertyModel.References array
  function ProcessForeignKey() {
    foreignKeyList.forEach(function (foreignKeyModel) {
      tableList.forEach(function (tableModel) {
        if (tableModel.Name === foreignKeyModel.ReferencesTableName) {
          tableModel.Properties.forEach(function (propertyModel) {
            if (propertyModel.Name === foreignKeyModel.ReferencesPropertyName) {
              propertyModel.IsForeignKey = true;
              propertyModel.References.push(foreignKeyModel);
            }
          });
        }
      });
    });
  }

  // Creates foreignKeyModel and assigns properties to arguments passed in
  function CreateForeignKey(primaryKeyName, primaryKeyTableName, referencesPropertyName, referencesTableName, isDestination) {
    const foreignKey = new ForeignKeyModel;
    
    foreignKey.PrimaryKeyTableName = primaryKeyTableName;
    foreignKey.PrimaryKeyName = primaryKeyName;
    foreignKey.ReferencesPropertyName = referencesPropertyName;
    foreignKey.ReferencesTableName = referencesTableName;
    foreignKey.IsDestination = (isDestination !== undefined && isDestination !== null) ? isDestination : false;

    return foreignKey;
  };
  
  // Creates primaryKeyModel and assigns properties to arguments passed in 
  function CreatePrimaryKey(primaryKeyName, primaryKeyTableName) {
    const primaryKey = new PrimaryKeyModel;

    primaryKey.PrimaryKeyTableName = primaryKeyTableName;
    primaryKey.PrimaryKeyName = primaryKeyName;

    return primaryKey;
  };

  // Creates propertyModel and assigns properties to arguments passed in
  function CreateProperty(name, tableName, foreignKey, isPrimaryKey) {
    const property = new PropertyModel;
    const isForeignKey = foreignKey !== undefined && foreignKey !== null;
    property.Name = name;
    property.TableName = tableName;
    property.IsForeignKey = isForeignKey;
    property.IsPrimaryKey = isPrimaryKey;
    return property;
  };

  // Creates a new table with name property assigned to argument passed in
  function CreateTable(name) {
    var table = new TableModel;

    table.Name = name;

    // Increment exported tables count
    exportedTables++;

    return table;
  };

  // Parses table name from CREATE TABLE line
  function ParseSQLServerName(name, property) {
    name = name.replace('[dbo].[', '');
    name = name.replace('](', '');
    name = name.replace('].[', '.');
    name = name.replace('[', '');

    if (property == undefined || property == null) {
      name = name.replace(' [', '');
      name = name.replace('] ', '');
    } else {
      if (name.indexOf(']') !== -1) {
        name = name.substring(0, name.indexOf(']'));
      }
    }

    if (name.lastIndexOf(']') === (name.length - 1)) {
      name = name.substring(0, name.length - 1);
    }

    if (name.lastIndexOf(')') === (name.length - 1)) {
      name = name.substring(0, name.length - 1);
    }

    if (name.lastIndexOf('(') === (name.length - 1)) {
      name = name.substring(0, name.length - 1);
    }

    name = name.replace(' ', '');

    return name;
  };

  // Checks whether CREATE TABLE query has '(' on separate line
  function ParseTableName(name) {
    if (name.charAt(name.length - 1) === '(') {
      name = ParseSQLServerName(name);
    }

    return name;
  };

  function parseAlterTable(tableName, constraint) {
    // const tableName = tmp.match(/(?<=ALTER\sTABLE\s)([a-zA-Z_]+)(?=\sADD\sCONSTRAINT)/)[0];
    tableName = tableName.trim();
    let currentTableModel;
    tableList.forEach(tableModel => {
      if (tableModel.Name === tableName) {
        currentTableModel = tableModel;
      }
    })
    if (constraint.indexOf('FOREIGN KEY') !== -1) {
      const name = constraint.substring(constraint.indexOf('FOREIGN KEY'), constraint.length - 1);
      ParseMySQLForeignKey(name, currentTableModel);
    } else if (constraint.indexOf('PRIMARY KEY') !== -1) {
      const name = constraint.substring(constraint.indexOf('PRIMARY KEY'), constraint.length - 1);
      parseMYSQLPrimaryKey(name, currentTableModel);
    }
  }

  function parseSQLServerPrimaryKey(name, currentTableModel, propertyType) {
    var primaryKey = name.replace('PRIMARY KEY (', '')
      .replace(')', '')
      .replace('PRIMARY KEY', '')
      .replace(/\"/g, '')
      .trim();

    // Create Primary Key
    var primaryKeyModel = CreatePrimaryKey(primaryKey, currentTableModel.Name);

    // Add Primary Key to List
    primaryKeyList.push(primaryKeyModel);

    // Create Property
    var propertyModel = CreateProperty(primaryKey, currentTableModel.Name, null, true);

    // Add Property to table if not both primary key and foreign key
      // If both, property is added when parsing foreign key
    if (propertyType !== 'SQLServer both') {
      currentTableModel.Properties.push(propertyModel);
    }
  }

  function parseMYSQLPrimaryKey(name, currentTableModel) {
    var primaryKeyName = name.slice(13).replace(')', '').replace(/\"/g, '');
    currentTableModel.Properties.forEach(property => {
      if (property.Name.split(' ')[0] === primaryKeyName) {
        property.IsPrimaryKey = true;
        primaryKeyList.push(property);
      }
    })
  }

  // Takes in SQL creation file as text, then parses
  function parseSql(text) {
    const lines = text.split('\n');
    tableCell = null;
    cells = [];
    exportedTables = 0;
    tableList = [];
    foreignKeyList = [];
    primaryKeyList = [];

    let currentTableModel = null;

    //Parse SQL to objects
    for (let i = 0; i < lines.length; i++) {

      rowCell = null;

      const tmp = lines[i].trim();

      const propertyRow = tmp.substring(0, 12).toLowerCase();

      if (currentTableModel !== null && tmp.includes(');')) {
        tableList.push(currentTableModel);
        currentTableModel = null;
      }

      //Parse Table
      if (propertyRow === 'create table') {

        //Parse row
        let name = tmp.substring(12).trim();

        //Parse Table Name
        name = ParseTableName(name);


        //Create Table
        currentTableModel = CreateTable(name);
      }
      // tmp === 'ALTER TABLE'
      else if (tmp === 'ALTER TABLE') {
        parseAlterTable(lines[i + 1], lines[i + 3]);
        i += 3;
      }

      // Parse Properties 
      else if (tmp !== '(' && currentTableModel != null && propertyRow !== 'alter table ') {

        //Parse the row
        var name = tmp.substring(0, (tmp.charAt(tmp.length - 1) === ',') ? tmp.length - 1 : tmp.length);

        // Check if first 10 characters are 'constraint'
        var constraint = name.substring(0, 10).toLowerCase();
        if (constraint === 'constraint') {
          // console.log('name before: ', name)
          if (name.indexOf("PRIMARY KEY") !== -1) {
            name = name.substring(name.indexOf("PRIMARY KEY"), name.length).replace(/\"/g, "")
          } else if (name.indexOf("FOREIGN KEY") !== -1) {
            name = name.substring(name.indexOf("FOREIGN KEY"), name.length).replace(/\"/g, "")
          }
          // console.log('name after: ', name)
        }

        //Attempt to get the Key Type
        var propertyType = name.substring(0, 11).toLowerCase();
        //Add special constraints
        if (propertyType !== 'primary key' && propertyType !== 'foreign key') {
          if (tmp.indexOf("PRIMARY KEY") !== -1 && tmp.indexOf("FOREIGN KEY") !== -1) {
            propertyType = "SQLServer both";
          } else if (tmp.indexOf("PRIMARY KEY") !== -1) {
            propertyType = "SQLServer primary key";
          } else if (tmp.indexOf("FOREIGN KEY") !== -1) {
            propertyType = "SQLServer foreign key";
          }
        }
        // Verify if this is a property that doesn't have a relationship (One minute of silence for the property)
        var normalProperty = propertyType !== 'primary key' && propertyType !== 'foreign key' && propertyType !== 'SQLServer primary key' && propertyType !== 'SQLServer foreign key' && propertyType !== 'SQLServer both';

        // Parse properties that don't have relationships
        if (normalProperty) {

          if (name === '' || name === "" || name === ");") {
            continue;
          }

          // For now, skip lines with these commands
          if (name.indexOf("ASC") !== -1 ||
            name.indexOf("DESC") !== -1 ||
            name.indexOf("EXEC") !== -1 ||
            name.indexOf("WITH") !== -1 ||
            name.indexOf("ON") !== -1 ||
            name.indexOf("ALTER") !== -1 ||
            name.indexOf("/*") !== -1 ||
            name.indexOf("CONSTRAIN") !== -1 ||
            name.indexOf("SET") !== -1 ||
            name.indexOf("NONCLUSTERED") !== -1 ||
            name.indexOf("GO") !== -1 ||
            name.indexOf("REFERENCES") !== -1 ||
            name.indexOf("OIDS") !== -1) {
            continue;
          }


          // Takes quotation marks out of normal property names
          name = name.replace(/\"/g, '');

          // Create Property
          var propertyModel = CreateProperty(name, currentTableModel.Name, null, false, false);

          // Add Property to table
          currentTableModel.Properties.push(propertyModel);
        }

        // Parse Primary Key
        if (propertyType === 'primary key' || propertyType === 'SQLServer primary key' || propertyType === 'SQLServer both') {
          // Parse Primary Key from SQL Server syntax
          if (propertyType === 'SQLServer primary key' || propertyType === 'SQLServer both') {
            if (name.indexOf('PRIMARY KEY') !== -1 && name.indexOf('CLUSTERED') === -1) {
              parseSQLServerPrimaryKey(name, currentTableModel, propertyType);
            } 
            
            // Parsing primary key from MySQL syntax
          } else if (propertyType === 'primary key') {
            parseMYSQLPrimaryKey(name, currentTableModel);
          }
        }

        // Parse Foreign Key
        if (propertyType === 'foreign key' || propertyType === 'SQLServer foreign key' || propertyType === 'SQLServer both') {
          // Parse Foreign Key from SQL Server syntax
          if (propertyType === 'SQLServer foreign key' || propertyType === 'SQLServer both') {
            let completeRow = name;
            if (propertyType === 'SQLServer both') {
              console.log(completeRow)
            }
            if (name.indexOf('REFERENCES') === -1) {
              const referencesRow = (lines[i + 1]).trim();
              completeRow = 'ALTER TABLE [dbo].[' + currentTableModel.Name + ']  WITH CHECK ADD' + ' ' + name + ' ' + referencesRow;
            }
            ParseSQLServerForeignKey(completeRow, currentTableModel, propertyType);
          }
          else {
            ParseMySQLForeignKey(name, currentTableModel);
          }
        }
      } 
    }

    // Process Primary Keys
    ProcessPrimaryKey();
    console.log(primaryKeyList);
    // Process Foreign Keys
    ProcessForeignKey();

    // Create Table in UI
    console.log(tableList)
    CreateTableUI();

  };
  // Adding Primary Key and Foreign Key designations for table columns
  function CheckSpecialKey(propertyModel) {
    if (propertyModel.IsForeignKey && propertyModel.IsPrimaryKey) {
      console.log('FOUND OUR BOTH:', propertyModel)
      return 'PK | FK';
    } else if (propertyModel.IsForeignKey) {
      return 'FK';
    } else if (propertyModel.IsPrimaryKey) {
      return 'PK';
    } else {
      return '';
    }
  }

  /*
  CreateTableUI() 
  Function that handles generation of graphviz wrapped in d3
  Uses an array d3Tables to keep track of all string syntax needed for graphviz
  strings are pushed into the array as needed and combined at the end 
   */
  function CreateTableUI() {
    const body = document.querySelector('body');
    const graph = document.createElement('div');
    graph.setAttribute('id', 'graph');
    body.appendChild(graph);
    // const graph = document.querySelector('#graph1');

    // Declaring custom d3 colors
    // #b0e298
    // Initial opening string for the rendering of the diagram.
    // Refer to https://graphviz.readthedocs.io/en/stable/manual.html#quoting-and-html-like-labels 
    let d3Tables = 
      [`
        digraph G { bgcolor = "none"
        graph [   rankdir = "LR" ];
        node [fontsize = 10 fontname = "opensans" shape=plain]
      `];

    tableList.forEach(function (tableModel) {

 
      // Push in string code to d3tables array to render table name as a row
      d3Tables.push(`
        ${tableModel.Name} [label=<<table border ="0" cellborder ="1" cellspacing = "0" color = "white" opacity = "0.5"><tr><td ALIGN = "LEFT" bgcolor = "#232d95"><b><font color = "white">${tableModel.Name}</font></b></td></tr>
      `)

      for (let i = 0; i < tableModel.Properties.length; i++) {
        // Render columns from the database that appear as rows on the table
        // If primary key or foreign key, add label to the row 
        if (CheckSpecialKey(tableModel.Properties[i])) {
          d3Tables.push(`
            <tr><td ALIGN = "LEFT" bgcolor = "gray25" port="${tableModel.Properties[i].Name.split(' ')[0]}"><font color = "#e2c044">${CheckSpecialKey(tableModel.Properties[i])} </font> | <font color = "white"> ${tableModel.Properties[i].Name}</font></td></tr>
          `)
        } else {
          d3Tables.push(`
            <tr><td ALIGN = "LEFT" bgcolor = "gray25" port ="${tableModel.Properties[i].Name.split(' ')[0]}"><font color = "white">          ${tableModel.Properties[i].Name}</font></td></tr>
          `)
        }

      }
      // Ending block for each table once the relevant rows/columns have been appended
      d3Tables.push(`
        </table>>];
      `)

    });
     /*  
      Loop through foreign keys for parsing relationships and drawing out 
      arrows with graphviz to depict how tables are related
     */
    foreignKeyList.forEach(ForeignKeyModel => {
      if (!ForeignKeyModel.IsDestination) {
        // d3Tables.push(`
        //   ${ForeignKeyModel.ReferencesTableName}:${ForeignKeyModel.ReferencesPropertyName} -> 
        //   ${ForeignKeyModel.PrimaryKeyTableName}:${ForeignKeyModel.PrimaryKeyName.split(' ')[0]} [color = lightseagreen]
        // `)
        d3Tables.push(`
          ${ForeignKeyModel.PrimaryKeyTableName}:${ForeignKeyModel.PrimaryKeyName.split(' ')[0]} -> ${ForeignKeyModel.ReferencesTableName}:${ForeignKeyModel.ReferencesPropertyName} [color = "#5ea54a"]
        `)
      }
    })
    // Closing curly brace for ending out graphviz syntax
    d3Tables.push('}')
    // Combine array to form a string for graphviz syntax
    let diagraphString = d3Tables.join('');
    // console.log(diagraphString);
    let graphviz = d3.select('#graph').graphviz();
    // Select #graph div and render the graph
    function render() {
      dotSrcLines = diagraphString.split('\n');
  
      graphviz
        .width(window.innerWidth)
        .height(window.innerHeight)
        .renderDot(diagraphString)
        .on("end", interactive);
    }

    function interactive() {
      const nodes = d3.selectAll('.node');
      const edges = d3.selectAll('.edge');
      const nodeList = nodes._groups[0];
      const edgeList = edges._groups[0];
      nodes
        .on("mouseenter", function () {
          const relatedTables = new Set();
          const title = d3.select(this).selectAll('title').text().trim();
          relatedTables.add(title);
          for (let i = 0; i < edgeList.length; i += 1) {
            const tableNames = edgeList[i].children[0].innerHTML.match(/([a-zA-Z_])+(?=:)/g);
            if (tableNames.includes(title)) {
              tableNames.forEach(tableName => {
                relatedTables.add(tableName);
              });
            } else {
              edgeList[i].style.opacity = '10%';
            }
          }
          for (let i = 0; i < nodeList.length; i += 1) {
            if (!relatedTables.has(nodeList[i].children[0].innerHTML)) {
              nodeList[i].style.opacity = '10%';
            }
          }
        })
        .on("mouseleave", function () {
          const relatedTables = new Set();
          const title = d3.select(this).selectAll('title').text().trim();
          relatedTables.add(title);
          for (let i = 0; i < edgeList.length; i += 1) {
            const tableNames = edgeList[i].children[0].innerHTML.match(/([a-zA-Z_])+(?=:)/g);
            if (tableNames.includes(title)) {
              tableNames.forEach(tableName => {
                relatedTables.add(tableName);
              });
            } else {
              edgeList[i].style.opacity = '100%';
            }
          }
          for (let i = 0; i < nodeList.length; i += 1) {
            if (!relatedTables.has(nodeList[i].children[0].innerHTML)) {
              nodeList[i].style.opacity = '100%';
            }
          }
        });
    }
    render(diagraphString);
  };

  // Functionality for exporting SVG
// Set-up the export button

// exportButton.addEventListener('click', () => {
//   const svg = document.querySelectorAll('svg')[0];

//   var svgData = document.querySelectorAll('svg')[0].outerHTML;
//   var svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
//   console.log('svgBlob',svgBlob)
//   var svgUrl = URL.createObjectURL(svgBlob);
//   svgUrl = svgUrl.slice(svgUrl.indexOf(':') + 1);
//   console.log('svgUrl',svgUrl)

//   const svgImage = document.createElement('img');
//   svgImage.src = svgUrl;
//   // document.querySelector('body').append(svgImage);
//   console.log('svgImage', svgImage)
//   const canvas = document.createElement('canvas');
//   canvas.width = svg.getAttribute('width');
//   canvas.height = svg.getAttribute('height');
//   const canvasCtx = canvas.getContext('2d');
//   canvasCtx.drawImage(svgImage, 0, 0);
//   const imgData = canvas.toDataURL('image/png');

//   // console.log('imgData: ', imgData)



//   window.postMessage({
//     command: 'exportSVG', 
//     text: imgData
//   })


// })



// d3.select('#exportButton').on('click', function() {
//   console.log('clicking export')
//   var svgData = document.querySelectorAll('svg')[0].outerHTML;
//   console.log(svgData)
//   var svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
//   console.log(svgBlob)
//   var svgUrl = URL.createObjectURL(svgBlob);
//   var downloadLink = document.createElement("a");
//   downloadLink.innerText = "hello";
//   downloadLink.href = svgUrl;
//   downloadLink.download = "newesttree.svg";
//   console.log(downloadLink)
//   body.appendChild(downloadLink);
//   // downloadLink.click();
//   // body.removeChild(downloadLink);
// })


// d3.select('#exportButton').on('click', function(){
//   var svg = document.querySelectorAll('svg')[0];
//   console.log(svg)
// 	var svgString = getSVGString(d3.select('svg').node());
// 	svgString2Image( svgString, 2*svg.getAttribute('width'), 2*svg.getAttribute('height'), 'png', save ); // passes Blob and filesize String to the callback

// 	function save( dataBlob, filesize ){
// 		saveAs( dataBlob, 'D3 vis exported to PNG.png' ); // FileSaver.js function
// 	}
// });

// // Below are the functions that handle actual exporting:
// // getSVGString ( svgNode ) and svgString2Image( svgString, width, height, format, callback )
// function getSVGString( svgNode ) {
// 	svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
// 	var cssStyleText = getCSSStyles( svgNode );
// 	appendCSS( cssStyleText, svgNode );

// 	var serializer = new XMLSerializer();
// 	var svgString = serializer.serializeToString(svgNode);
// 	svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
// 	svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

// 	return svgString;

// 	function getCSSStyles( parentElement ) {
// 		var selectorTextArr = [];

// 		// Add Parent element Id and Classes to the list
// 		selectorTextArr.push( '#'+parentElement.id );
// 		for (var c = 0; c < parentElement.classList.length; c++)
// 				if ( !contains('.'+parentElement.classList[c], selectorTextArr) )
// 					selectorTextArr.push( '.'+parentElement.classList[c] );

// 		// Add Children element Ids and Classes to the list
// 		var nodes = parentElement.getElementsByTagName("*");
// 		for (var i = 0; i < nodes.length; i++) {
// 			var id = nodes[i].id;
// 			if ( !contains('#'+id, selectorTextArr) )
// 				selectorTextArr.push( '#'+id );

// 			var classes = nodes[i].classList;
// 			for (var c = 0; c < classes.length; c++)
// 				if ( !contains('.'+classes[c], selectorTextArr) )
// 					selectorTextArr.push( '.'+classes[c] );
// 		}

// 		// Extract CSS Rules
// 		var extractedCSSText = "";
// 		for (var i = 0; i < document.styleSheets.length; i++) {
// 			var s = document.styleSheets[i];
			
// 			try {
// 			    if(!s.cssRules) continue;
// 			} catch( e ) {
// 		    		if(e.name !== 'SecurityError') throw e; // for Firefox
// 		    		continue;
// 		    	}

// 			var cssRules = s.cssRules;
// 			for (var r = 0; r < cssRules.length; r++) {
// 				if ( contains( cssRules[r].selectorText, selectorTextArr ) )
// 					extractedCSSText += cssRules[r].cssText;
// 			}
// 		}
		

// 		return extractedCSSText;

// 		function contains(str,arr) {
//         return arr.indexOf( str ) === -1 ? false : true;
//       }

//     }

//     function appendCSS( cssText, element ) {
//       var styleElement = document.createElement("style");
//       styleElement.setAttribute("type","text/css"); 
//       styleElement.innerHTML = cssText;
//       var refNode = element.hasChildNodes() ? element.children[0] : null;
//       element.insertBefore( styleElement, refNode );
//     }
//   }


//   function svgString2Image( svgString, width, height, format, callback ) {
//     var format = format ? format : 'png';

//     var imgsrc = 'data:image/svg+xml;base64,'+ btoa( unescape( encodeURIComponent( svgString ) ) ); // Convert SVG string to data URL

//     var canvas = document.createElement("canvas");
//     var context = canvas.getContext("2d");

//     canvas.width = width;
//     canvas.height = height;

//     var image = new Image();
//     image.onload = function() {
//       context.clearRect ( 0, 0, width, height );
//       context.drawImage(image, 0, 0, width, height);

//       canvas.toBlob( function(blob) {
//         console.log('should save here')
//         var filesize = Math.round( blob.length/1024 ) + ' KB';
//         if ( callback ) callback( blob, filesize );
//       });

      
//     };

//     image.src = imgsrc;
//     console.log(image)
//   }











  // Event Listeners
  // Webview panel listens for messages from extension
  let counter = 0;
  window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
      // If message.command = sendText, reassign sqlInput value to message.text
      case 'sendText':
        sqlInput.value = message.text;
        // If first time receiving sentText message, invoke parseSql
        if (counter === 0) {
          counter++;
          parseSql(sqlInput.value);
        };
        break;
      case 'parseAgain': 
        // Remove any existing graphs to avoid duplicate rendering
        const graph = document.querySelector('#graph');
        body.removeChild(graph);
        
        parseSql(sqlInput.value);
        break;
    };
  });

});
