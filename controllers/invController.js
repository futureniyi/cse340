const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {\n+    const nav = await utilities.getNav()\n+    res.render(\"./inventory/add-classification\", {\n+      title: \"Add Classification\",\n+      nav,\n+      errors: null,\n+    })\n+  } catch (error) {\n+    next(error)\n+  }\n+}\n+\n+/* ***************************\n+ *  Add new classification\n+ * ************************** */\n+invCont.addClassification = async function (req, res, next) {\n+  let nav = await utilities.getNav()\n+  const { classification_name } = req.body\n+  const addResult = await invModel.addClassification(classification_name)\n+\n+  if (addResult && addResult.rowCount > 0) {\n+    nav = await utilities.getNav()\n+    req.flash(\"notice\", `${classification_name} was successfully added.`)\n+    res.status(201).render(\"./inventory/management\", {\n+      title: \"Inventory Management\",\n+      nav,\n+      errors: null,\n+    })\n+  } else {\n+    req.flash(\"notice\", \"Sorry, adding the classification failed.\")\n+    res.status(501).render(\"./inventory/add-classification\", {\n+      title: \"Add Classification\",\n+      nav,\n+      errors: null,\n+      classification_name,\n+    })\n+  }\n+}\n+\n*** End Patch
/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

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
