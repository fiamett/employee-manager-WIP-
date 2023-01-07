INSERT INTO departments (name)
VALUES ("aaa"),
       ("bbb"),
       ("ccc");

INSERT INTO roles (title, salary, department_id)
VALUES ("one", 111, 1),
       ("two", 222, 2),
       ("three", 333, 1),
       ("four", 444, 3);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("AAAA", "aaaa", 3, NULL),
       ("BBBB", "bbbb", 2, NULL),
       ("CCCC", "cccc", 4, 1),
       ("DDDD", "dddd", 1, 2);

