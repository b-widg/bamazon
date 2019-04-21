// procucts table fields: 
  // item_id (auto-incriment, Int, primary key)
  // product_name (varChar255)
  // department_name varChar255)
  // price (Float)
  // stock_quantity(Int)
require('dotenv').config();   // https://www.npmjs.com/package/dotenv
var mysql = require('mysql');   // https://www.npmjs.com/package/mysql
var Table = require('cli-table3');  // https://www.npmjs.com/package/cli-table3
var term = require('terminal-kit').terminal ;   // https://www.npmjs.com/package/terminal-kit
var inquirer = require('inquirer');   // https://www.npmjs.com/package/inquirer#prompt

var quantityOrdered = 0;
var itemID = 0;

//  https://www.youtube.com/watch?v=EN6Dx22cPRI

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: process.env.WEBSITE_USER,
    password: process.env.WEBSITE_PASSWORD,
    database: "bamazon"
  });

connection.connect(function(error) {
  if (error) throw error;
});

term.green(`\nWelcome To Bamazon! Taking over the world 10 products at a time!\n`); 

getProductsTableData();

function getProductsTableData() {
  connection.query("SELECT * FROM products", function(error, result) {
    if (error) throw error;
    displayProductsTable(result);
    //connection.end();
  });
}

function displayProductsTable(result){
  var productTable = new Table({
    head: ['Product ID', 'Description', 'Price', 'Quantity'],
    colWidths: [15, 45, 15]
  });
  for(let item in result) {
      productTable.push([result[item].item_id, result[item].product_name, `$` + result[item].price, result[item].stock_quantity]);
  }
  console.log(productTable.toString());
  promptUser(questions);
}

var questions = [{
  index: 0,
  type: 'input',
  name: 'ProductID',
  message: `Please enter the ID of the product you would like to order.`,
},
{
  index: 1,
  type: 'input',
  name: 'quantity',
  message: `Please enter quantity of units you would like to order.`,
}]
// {
//   index: 2,
//   type: 'input',
//   name: 'too-many-reorder',
//   message: `The number of units exceeds anount in stock.  Would you like to order what we have?`,
// }

  
function promptUser(userPrompts){
  inquirer.prompt(userPrompts).then(answers => {
    itemID = answers.ProductID;
    quantityOrdered = answers.quantity;
    console.log('quantityOrdered:', quantityOrdered)
    console.log('itemID:', itemID)
    checkStock(itemID, quantityOrdered);
    
  });
}

function checkStock(ID, quantity){
  console.log('quantity:', quantity)
  console.log('ID:', ID)

  // connection.connect(function(error) {
  //   if (error) throw error;
  // });
  connection.query(`SELECT * FROM products WHERE item_id = ${ID}`, function(error, result) {
    if (error) throw error;
    let numInStock = result[4].stock_quantity;
    Console.log(numInStock);

    
    
    connection.end();
  });
  connection.end();
}









