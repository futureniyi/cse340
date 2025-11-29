// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountsController = require("../controllers/accountsController")

// Route to build "My Account" login view (path after "account")
router.get("/login", utilities.handleErrors(accountsController.buildLogin))

module.exports = router;
