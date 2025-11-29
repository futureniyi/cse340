const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  // req.flash("notice", "This is a flash message.")
  res.render("index", {title: "Home", nav})
}

/* ***************************
 *  Intentional 500 error trigger
 * ************************** */
baseController.triggerError = async function(req, res){
  const err = new Error("Intentional server error for testing.")
  err.status = 500
  throw err
}

module.exports = baseController
