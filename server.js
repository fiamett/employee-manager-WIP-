const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const fs = require('fs');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'workers_db'
    },
    console.log(`Connected to the workers_db database.`)
  );

  
inquirer
.prompt([
  {
    type: 'list',
    message: 'What would you like to do',
    name: 'choice',
    choices: ['view all departments','view all roles','view all employees','add a department','add a role','add an employee','update an employee role'],
  },
])
.then((data) => {
  switch(data){
    case 'view all departments':
      break;
    case 'view all roles':
      break;
    case 'view all employees':
      break;
    case 'add a department':
      break;
    case 'add a role':
      break;
    case 'add an employee':
      break;
    case 'update an employee role':
      break;
  }
  });