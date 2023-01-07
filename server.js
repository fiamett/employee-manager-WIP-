import mysql from "mysql2";
import inquirer from "inquirer";
//const fs = require('fs');
import cTable from "console.table";
var col = [];

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "password",
    database: "workers_db",
  },
  console.log(`Connected to the workers_db database.`)
);

function ask() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do",
        name: "choice",
        choices: [
          "view all departments",
          "view all roles",
          "view all employees",
          "view employees by manager",
          "view employees by department",
          "view money used by department",
          "add a department",
          "add a role",
          "add an employee",
          "update an employee role",
          "update employee manager",
          "delete departments",
          "delete roles",
          "delete employees",
        ],
      },
    ])
    .then((task) => {
      switch (task.choice) {
        case "view all departments":
          db.query("SELECT * FROM departments", function (err, results) {
            console.table(results);
            ask();
          });
          break;
        case "view all roles":
          db.query(
            "select r.*,d.* from roles r join (select id as dep_id,name from departments) d on d.dep_id = r.department_id;",
            function (err, results) {
              console.table(results);
              ask();
            }
          );
          break;
        case "view all employees":
          db.query(
            "select e.*,r.*,d.* from employees e join (select id as role_id,title,salary,department_id from roles) r on r.role_id = e.role_id join (select id as department_id,name as dep_name from departments) d on r.department_id = d.department_id;",
            function (err, results) {
              console.table(results);
              ask();
            }
          );

          break;
        case "view employees by manager":
          db.query(
            "select * from employees",
            function (err, results) {
              var managers = [];
              managers = managers.concat(results.map((ins) => {return ins.manager_id}))
              inquirer
                .prompt([
                  {
                    type: "list",
                    message: "which manager?",
                    name: "manager",
                    choices: (results.map((ins) => {if (managers.includes(ins.id)) {return ins.first_name + ' ' +ins.last_name}})).filter((ins)=>{if (ins != undefined){return true}}),
                  },
                ])
                .then((ans) => {
                  db.query(
                    "select e.*,r.*,d.* from employees e join (select id as role_id,title,salary,department_id from roles) r on r.role_id = e.role_id join (select id as department_id,name dep_name from departments) d on r.department_id = d.department_id where manager_id  = " +
                      results[
                        results.findIndex((ins) => {
                          if ((ins.first_name + " " + ins.last_name) == ans.manager) {
                            return true;
                          }
                        })
                      ].id,
                    (err, results) => {
                      console.table(results);
                      ask();
                    }
                  );
                });
            }
          );
          break;
        case "view employees by department":
          db.query("select * from departments", function (err, results) {
            inquirer
              .prompt([
                {
                  type: "list",
                  message: "which department?",
                  name: "dep",
                  choices: results.map((ins) => {
                    return ins.name;
                  }),
                },
              ])
              .then((ans) => {
                db.query(
                  "select e.*,r.*,d.* from employees e join (select id as role_id,title,salary,department_id from roles) r on r.role_id = e.role_id join (select id as department_id,name as dep_name from departments) d on r.department_id = d.department_id where dep_name = " +
                    '"' +
                    ans.dep +
                    '"',
                  (err, results) => {
                    console.table(results);
                    ask();
                  }
                );
              });
          });
          break;
        case "view money used by department":
          db.query("select * from departments", function (err, results) {
            inquirer
              .prompt([
                {
                  type: "list",
                  message: "which department?",
                  name: "dep",
                  choices: results.map((ins) => {
                    return ins.name;
                  }),
                },
              ])
              .then((ans) => {
                db.query(
                  "select * from employees join roles on roles.id = employees.role_id join departments on roles.department_id  = departments.id where name = " +
                    '"' +
                    ans.dep +
                    '"',
                  (err, results) => {
                    var total = 0;
                    for (var i = 0; i < results.length; i++) {
                      total += +results[i].salary;
                    }
                    console.log(total);
                    ask();
                  }
                );
              });
          });
          break;
        case "add a department":
          inquirer
            .prompt([
              {
                type: "input",
                message: "department name?",
                name: "name",
              },
            ])
            .then((ans) => {
              db.query(
                'insert into departments (name) values ("' + ans.name + '");',
                function (err, results) {
                  err ? console.log(err) : console.log("success");
                  ask();
                }
              );
            });
          break;
        case "add a role":
          db.query("SELECT * FROM departments", function (err, results) {
            inquirer
              .prompt([
                {
                  type: "input",
                  message: "job title?",
                  name: "title",
                },
                {
                  type: "number",
                  message: "salary",
                  name: "salary",
                },
                {
                  type: "list",
                  massage: "which department?",
                  name: "dep",
                  choices: results.map((ins) => {
                    return ins.name;
                  }),
                },
              ])
              .then((ans) => {
                db.query(
                  'insert into roles (title, salary, department_id) values ("' +
                    ans.title +
                    '",' +
                    ans.salary +
                    "," +
                    results[
                      results.findIndex((ins) => {
                        if (ins.name == ans.dep) {
                          return true;
                        }
                      })
                    ].id +
                    ");",
                  function (err, results) {
                    err ? console.log(err) : console.log("success");
                    ask();
                  }
                );
              });
          });
          break;
        case "add an employee":
          db.query("SELECT * FROM roles", function (err, rol) {
            db.query("select * from employees", function (err, emp) {
              inquirer
                .prompt([
                  {
                    type: "input",
                    message: "first name?",
                    name: "fn",
                  },
                  {
                    type: "input",
                    message: "last_name",
                    name: "ln",
                  },
                  {
                    type: "list",
                    massage: "role?",
                    name: "role",
                    choices: rol.map((ins) => {
                      return ins.title;
                    }),
                  },
                  {
                    type: "list",
                    message: "manager?",
                    name: "mane",
                    choices: emp.map((ins) => {
                      return ins.first_name + " " + ins.last_name;
                    }),
                  },
                ])
                .then((ans) => {
                  db.query(
                    'insert into employees (first_name, last_name, role_id, manager_id) values ("' +
                      ans.fn +
                      '","' +
                      ans.ln +
                      '",' +
                      rol[
                        rol.findIndex((ins) => {
                          if (ins.title == ans.role) {
                            return true;
                          }
                        })
                      ].id +
                      "," +
                      emp[
                        emp.findIndex((ins) => {
                          if (
                            ins.first_name + " " + ins.last_name ==
                            ans.mane
                          ) {
                            return true;
                          }
                        })
                      ].id +
                      ");",
                    function (err, results) {
                      err ? console.log(err) : console.log("success");
                      ask();
                    }
                  );
                });
            });
          });
          break;
        case "update an employee role":
          db.query("select * from employees", function (err, emp) {
            db.query("select * from roles", function (err, rol) {
              inquirer
                .prompt([
                  {
                    type: "list",
                    message: "who do you want to change role?",
                    name: "edit",
                    choices: emp.map((ins) => {
                      return ins.first_name + " " + ins.last_name;
                    }),
                  },
                  {
                    type: "list",
                    message: "new role?",
                    name: "role",
                    choices: rol.map((ins) => {
                      return ins.title;
                    }),
                  },
                ])
                .then((ans) => {
                  db.query(
                    "update employees set role_id = " +
                      rol[
                        rol.findIndex((ins) => {
                          if (ins.title == ans.role) {
                            return true;
                          }
                        })
                      ].id +
                      " where id = " +
                      emp[
                        emp.findIndex((ins) => {
                          if (
                            ins.first_name + " " + ins.last_name ==
                            ans.edit
                          ) {
                            return true;
                          }
                        })
                      ].id,
                    function (err, results) {
                      err ? console.log(err) : console.log("success");
                      ask();
                    }
                  );
                });
            });
          });
          break;
        case "update employee manager":
          db.query("select * from employees", function (err, emp) {
            inquirer
              .prompt([
                {
                  type: "list",
                  message: "employee to change",
                  name: "sub",
                  choices: emp.map((ins) => {
                    return ins.first_name + " " + ins.last_name;
                  }),
                },
                {
                  type: "list",
                  message: "new manager",
                  name: "mane",
                  choices: emp.map((ins) => {
                    return ins.first_name + " " + ins.last_name;
                  }),
                },
              ])
              .then((ans) => {
                db.query(
                  "update employees set manager_id = " +
                    emp[
                      emp.findIndex((ins) => {
                        if (ins.first_name + " " + ins.last_name == ans.mane) {
                          return true;
                        }
                      })
                    ].id +
                    " where id = " +
                    emp[
                      emp.findIndex((ins) => {
                        if (ins.first_name + " " + ins.last_name == ans.sub) {
                          return true;
                        }
                      })
                    ].id,
                  function (err, results) {
                    err ? console.log(err) : console.log("success");
                    ask();
                  }
                );
              });
          });
          break;
        case "delete departments":
          db.query("select * from departments", function (err, results) {
            inquirer
              .prompt([
                {
                  type: "list",
                  message: "which department do you want to delete?",
                  name: "tbd",
                  choices: results.map((ins) => {
                    return ins.name;
                  }),
                },
              ])
              .then((ans) => {
                db.query(
                  'delete from departments where name = "' + ans.tbd + '"',
                  function (err, results) {
                    err ? console.log(err) : console.log("success");
                    ask();
                  }
                );
              });
          });
          break;
        case "delete roles":
          db.query("select * from roles", function (err, results) {
            inquirer
              .prompt([
                {
                  type: "list",
                  message: "which role do you want to delete?",
                  name: "tbd",
                  choices: results.map((ins) => {
                    return ins.title;
                  }),
                },
              ])
              .then((ans) => {
                db.query(
                  'delete from roles where title = "' + ans.tbd +'"',
                  function (err, results) {
                    err ? console.log(err) : console.log("success");
                    ask();
                  }
                );
              });
          });
          break;
        case "delete employees":
          db.query("select * from employees", function (err, results) {
            inquirer
              .prompt([
                {
                  type: "list",
                  message: "which employee do you want to delete?",
                  name: "tbd",
                  choices: results.map((ins) => {
                    return ins.first_name + " " + ins.last_name;
                  }),
                },
              ])
              .then((ans) => {
                db.query(
                  "delete from employees where id = " +
                    results[
                      results.findIndex((ins) => {
                        if (ins.first_name + " " + ins.last_name == ans.tbd) {
                          return true;
                        }
                      })
                    ].id,
                  function (err, results) {
                    err ? console.log(err) : console.log("success");
                    ask();
                  }
                );
              });
          });
          break;
      }
    });
}

ask();
