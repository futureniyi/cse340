const jwt = require("jsonwebtoken")
require("dotenv").config()
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  try {
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult && regResult.rowCount > 0) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
        nav,
      })
    }
  } catch (error) {
    if (error.code === "23505") {
      req.flash("notice", "That email is already registered. Please log in.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
    req.flash("notice", "Sorry, the registration failed.")
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}



/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Deliver account management view
 * ************************************ */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildAccountUpdate(req, res, next) {
  let nav = await utilities.getNav()
  const accountId = parseInt(req.params.accountId)
  const accountData = await accountModel.getAccountById(accountId)
  if (!accountData) {
    req.flash("notice", "Account not found.")
    return res.redirect("/account/")
  }
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_id: accountData.account_id,
  })
}

/* ****************************************
*  Process account update
* *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const {
    account_id,
    account_firstname,
    account_lastname,
    account_email,
  } = req.body

  try {
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    )

    if (updateResult) {
      const refreshedAccount = await accountModel.getAccountById(updateResult.account_id)
      if (refreshedAccount) {
        delete refreshedAccount.account_password
        const accessToken = jwt.sign(refreshedAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
        const cookieOptions = process.env.NODE_ENV === "development"
          ? { httpOnly: true, maxAge: 3600 * 1000 }
          : { httpOnly: true, secure: true, maxAge: 3600 * 1000 }
        res.cookie("jwt", accessToken, cookieOptions)
      }
      req.flash("notice", "Account information updated.")
      return res.redirect("/account/")
    }

    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    })
  } catch (error) {
    req.flash("notice", "Sorry, the update failed.")
    res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    })
  }
}

/* ****************************************
*  Process password change
* *************************************** */
async function updatePassword(req, res, next) {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword)
    if (updateResult) {
      const refreshedAccount = await accountModel.getAccountById(account_id)
      if (refreshedAccount) {
        delete refreshedAccount.account_password
        const accessToken = jwt.sign(refreshedAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
        const cookieOptions = process.env.NODE_ENV === "development"
          ? { httpOnly: true, maxAge: 3600 * 1000 }
          : { httpOnly: true, secure: true, maxAge: 3600 * 1000 }
        res.cookie("jwt", accessToken, cookieOptions)
      }
      req.flash("notice", "Password updated successfully.")
      return res.redirect("/account/")
    }
    req.flash("notice", "Sorry, the password update failed.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
    })
  } catch (error) {
    req.flash("notice", "Sorry, the password update failed.")
    res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
    })
  }
}

/* ****************************************
*  Process logout
* *************************************** */
async function accountLogout(req, res, next) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  return res.redirect("/")
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildAccountUpdate, updateAccount, updatePassword, accountLogout }
