// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountsController = require("../controllers/accountsController")

// Route to build "My Account" login view (path after "account")
router.get("/login", utilities.handleErrors(accountsController.buildLogin))
// router.post("/login", utilities.handleErrors(accountsController.loginAccount))

// Route to build registration view
router.get("/register", utilities.handleErrors(accountsController.buildRegister))

// Route to handle registration submission
router.post("/register", utilities.handleErrors(accountsController.registerAccount))

module.exports = router;
