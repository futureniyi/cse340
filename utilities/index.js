const jwt = require("jsonwebtoken")
require("dotenv").config()

const invModel = require("../models/inventory-model")
const Util = {}

// Default vehicle imagery used when inventory records do not include image paths
const PLACEHOLDER_IMAGE = "/images/vehicles/no-image.png"
const PLACEHOLDER_THUMB = "/images/vehicles/no-image-tn.png"

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
    let list = "<ul>"
    console.log(data)
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      const thumbnailSrc = vehicle.inv_thumbnail || PLACEHOLDER_THUMB
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + thumbnailSrc 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" onerror="this.onerror=null;this.src=\'' + PLACEHOLDER_THUMB + '\';" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the classification select list
* ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* **************************************
* Build a single vehicle detail view
* ************************************ */
Util.buildVehicleDetail = async function(vehicle){
  if(!vehicle){
    return '<p class="notice">Sorry, that vehicle could not be found.</p>'
  }

  const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(vehicle.inv_price)
  const miles = new Intl.NumberFormat('en-US').format(vehicle.inv_miles)
  const imageSrc = vehicle.inv_image || PLACEHOLDER_IMAGE

  let detail = '<section class="vehicle-detail">'
  detail += '<div class="vehicle-hero">'
  detail += '<img src="' + imageSrc + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model + '" onerror="this.onerror=null;this.src=\'' + PLACEHOLDER_IMAGE + '\';" />'
  detail += '</div>'
  detail += '<div class="vehicle-meta">'
  detail += '<h2>' + vehicle.inv_year + ' ' + vehicle.inv_make + ' ' + vehicle.inv_model + '</h2>'
  detail += '<p class="vehicle-price"><strong>Price:</strong> ' + price + '</p>'
  detail += '<p class="vehicle-mileage"><strong>Mileage:</strong> ' + miles + ' miles</p>'
  detail += '<p class="vehicle-color"><strong>Color:</strong> ' + vehicle.inv_color + '</p>'
  if (vehicle.classification_name) {
    detail += '<p class="vehicle-category"><strong>Category:</strong> ' + vehicle.classification_name + '</p>'
  }
  detail += '<p class="vehicle-description">' + vehicle.inv_description + '</p>'
  detail += '</div>'
  detail += '</section>'

  return detail
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (!req.cookies.jwt) {
    next()
    return
  }

  try {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in.")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      })
  } catch (error) {
    req.flash("notice", "Please log in.")
    res.clearCookie("jwt")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

/* ****************************************
 *  Restrict access to employees/admins
 * ************************************ */
Util.checkEmployeeAdmin = (req, res, next) => {
  const accountType = res.locals?.accountData?.account_type
  if (res.locals.loggedin && (accountType === "Employee" || accountType === "Admin")) {
    return next()
  }
  req.flash("notice", "You do not have permission to perform that action.")
  return res.redirect("/account/login")
}

module.exports = Util
