// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountsController = require("../controllers/accountsController")

// Route to build "My Account" view (path after "account")
router.get("/", utilities.handleErrors(accountsController.buildAccount))

module.exports = router;
