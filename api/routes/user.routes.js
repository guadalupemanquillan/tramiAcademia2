const express = require("express");
const userRouter = express.Router();

const {
  createNewUserController,
} = require("../controllers/user/createNewUser.controller");

const {
  putOneUserController,
} = require("../controllers/user/putOneUser.controller");

const {
  getOneUserController,
} = require("../controllers/user/getOneUser.controller");

const {
  getAllUserController,
} = require("../controllers/user/getAllUser.controller");

const {
  deleteUserController,
} = require("../controllers/user/deleteUser.controller");

// POST
userRouter.post("/", createNewUserController);

// GET
userRouter.get("/:id", getOneUserController);
userRouter.get("/", getAllUserController);

// PUT
userRouter.put("/:id", putOneUserController);

// DELETE
userRouter.delete("/:id", deleteUserController);

module.exports = userRouter;
