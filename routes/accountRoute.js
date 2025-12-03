// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountsController = require("../controllers/accountsController")
const regValidate = require('../utilities/account-validation')

// Default account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountsController.buildAccountManagement))

// Account update view
router.get("/update/:accountId", utilities.checkLogin, utilities.handleErrors(accountsController.buildAccountUpdate))

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

// Logout
router.get("/logout", utilities.handleErrors(accountsController.accountLogout))

// Process account update
router.post(
  "/update",
  utilities.checkLogin,
  regValidate.accountUpdateRules(),
  regValidate.checkAccountUpdateData,
  utilities.handleErrors(accountsController.updateAccount)
)

// Process password change
router.post(
  "/update-password",
  utilities.checkLogin,
  regValidate.passwordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountsController.updatePassword)
)

module.exports = router;
