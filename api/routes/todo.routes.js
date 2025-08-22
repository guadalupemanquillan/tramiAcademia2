const express = require("express");
const todoRouter = express.Router();

const {
  createNewTodoController,
} = require("../controllers/todo/createNewTodo.controller");

const {
  deleteOneTodoController,
} = require("../controllers/todo/deleteOneTodo.controller");

const {
  putOneTodoController,
} = require("../controllers/todo/putOneTodo.controller");

const {
  getOneTodoController,
} = require("../controllers/todo/getOneTodo.controller");

const {
  getAllTodoController,
} = require("../controllers/todo/getAllTodo.controller");

// GET
todoRouter.get("/:id", getOneTodoController);
todoRouter.get("/", getAllTodoController);

// POST
todoRouter.post("/", createNewTodoController);

// PUT
todoRouter.put("/:id", putOneTodoController);

// DELETE
todoRouter.delete("/:id", deleteOneTodoController);

module.exports = todoRouter;
