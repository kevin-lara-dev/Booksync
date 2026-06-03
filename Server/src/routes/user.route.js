const express = require("express");
const UserController = require("../controllers/user.controller")
const verifyToken = require("../middlewares/auth.middleware")
const isAdmin = require("../middlewares/role.middleware")


const router = express.Router();


router.get("/", verifyToken, isAdmin, UserController.getAllUsers)

router.get("/profile", verifyToken, UserController.getProfile)

router.put("/profile", verifyToken, UserController.updateProfile)

router.patch("/profile/password", verifyToken, UserController.changePassword)

router.patch("/:id/status", verifyToken, isAdmin, UserController.changeStatus)

router.patch("/:id/role", verifyToken, isAdmin, UserController.changeRole)

router.patch("/:id/password", verifyToken, UserController.changePassword)

router.delete("/profile", verifyToken, UserController.deleteProfile)



module.exports = router;
