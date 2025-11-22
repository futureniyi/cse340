const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  let nav = await utilities.getNav()
  if (!data || data.length === 0) {
    next({ status: 404, message: "Sorry, no vehicles were found for that classification." })
    return
  }
  const grid = await utilities.buildClassificationGrid(data)
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory item detail view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const invId = req.params.invId
  const data = await invModel.getInventoryByInvId(invId)
  let nav = await utilities.getNav()
  if (!data) {
    next({ status: 404, message: "Sorry, that vehicle could not be found." })
    return
  }
  const vehicleName = `${data.inv_make} ${data.inv_model}`
  const detail = await utilities.buildVehicleDetail(data)
  res.render("./inventory/detail", {
    title: `${data.inv_year} ${vehicleName}`,
    nav,
    detail,
  })
}


module.exports = invCont
