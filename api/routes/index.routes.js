const express = require("express");
const { auth } = require("../middlewares/auth.middleware");
const router = express.Router();

// RUTA AUTH
const loginRouter = require("./login.routes");
router.use("/auth", loginRouter);

// RUTA EMPRESA
const empresaRouter = require("./empresa.routes");
router.use("/empresa", auth, empresaRouter);

// RUTA CATEGORIA
const categoriaRouter = require("./categoria.routes");
router.use("/categoria", auth, categoriaRouter);

// RUTA ARTICULO
const articuloRouter = require("./articulo.routes");
router.use("/articulo", auth, articuloRouter);

// RUTA LOGROS
const logrosRouter = require("./logros.routes");
router.use("/logros", auth, logrosRouter);

// RUTA USUARIOS
const userRouter = require("./user.routes");
router.use("/usuarios", auth, userRouter);

// RUTA TAREAS
const tareasRouter = require("./tareas.routes");
router.use("/tareas", auth, tareasRouter);

// RUTA VIDEO
const videoRouter = require("./video.routes");
router.use("/video", auth, videoRouter);

// RUTA TODO
const todoRouter = require("./todo.routes");
router.use("/todo", auth, todoRouter);

// RUTA TEST
const testRouter = require("./test.routes");
router.use("/test", auth, testRouter);


module.exports = router;
