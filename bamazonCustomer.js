// procucts table fields: 
  // item_id (auto-incriment, Int, primary key)
  // product_name (varChar255)
  // department_name (varChar255)
  // price (Float)
  // stock_quantity(Int)
require('dotenv').config();   // https://www.npmjs.com/package/dotenv
var mysql = require('mysql');   // https://www.npmjs.com/package/mysql
var Table = require('cli-table3');  // https://www.npmjs.com/package/cli-table3
var term = require('terminal-kit').terminal ;   // https://www.npmjs.com/package/terminal-kit
var inquirer = require('inquirer');   // https://www.npmjs.com/package/inquirer#prompt

var quantityOrdered = 0;
var itemID = 0;
var validationError = false;



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

term.brightGreen(`\nWelcome To Bamazon! Taking over the world 10 products at a time!\n`); 

getProductsTableData();

function getProductsTableData() {
  connection.query("SELECT * FROM products", function(error, result) {
    if (error) throw error;
    displayProductsTable(result);
  });
}

function displayProductsTable(result){
  var productTable = new Table({
    head: ['Product ID', 'Description', 'Price', 'Quantity'],
    colWidths: [15, 45, 15]
  });
  for (let item in result) {
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
function promptUser(userPrompts){
  inquirer.prompt(userPrompts).then(answers => {
    itemID = parseInt(answers.ProductID);
    quantityOrdered = parseInt(answers.quantity);
    if (!Number.isInteger(itemID) || itemID < 1 || itemID > 10) {
      term.brightRed(`\nID must be a whole number between 1 and 10.  Order Canceled.\n`);
      validationError = true;
    }
    if (!Number.isInteger(quantityOrdered) || quantityOrdered < 1) {
      term.brightRed(`\nQuantity must be a whole number greater than zero. Order Canceled.\n`);
      validationError = true; 
    }
    if (validationError) {
      process.exit();
    }
    checkStock(itemID, quantityOrdered);
    
  });
}

function checkStock(ID, quantityRequested){
  connection.query(`SELECT * FROM products WHERE item_id = ${ID}`, function(error, result) {
    if (error) throw error;

    let quantityInStock = result[0].stock_quantity;
    let price = result[0].price;

    if (quantityRequested <= quantityInStock) {
      price = quantityRequested * price;
      term.brightGreen(`\nThank you for your order.  Your total is $${price.toFixed(2)}.\n`);
      connection.query(`UPDATE products SET stock_quantity = ${quantityInStock - quantityRequested} WHERE item_id = ${ID}`, function(error, result) {
        if (error) throw error;
      });
      connection.end();
    } else {
      term.brightRed(`\nQuantity exceeds available stock.  Order Canceled.\n`); 
      process.exit();
    }
  });
}









