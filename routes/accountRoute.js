// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountsController = require("../controllers/accountsController")
const regValidate = require('../utilities/account-validation')

// Default account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountsController.buildAccountManagement))

// Route to build "My Account" login view (path after "account")
router.get("/login", utilities.handleErrors(accountsController.buildLogin))
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountsController.accountLogin)
)

// Route to build registration view
router.get("/register", utilities.handleErrors(accountsController.buildRegister))

// Route to handle registration submission
// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountsController.registerAccount)
)

module.exports = router;
