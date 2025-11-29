const { body, validationResult } = require("express-validator")
const utilities = require(".")
const invValidate = {}

/*  **********************************
  *  Classification Data Validation Rules
  * ********************************* */
invValidate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name may not contain spaces or special characters."),
  ]
}

/*  **********************************
  *  Inventory Data Validation Rules
  * ********************************* */
invValidate.inventoryRules = () => {
  return [
    body("inv_make").trim().escape().notEmpty().withMessage("Please provide the vehicle make."),
    body("inv_model").trim().escape().notEmpty().withMessage("Please provide the vehicle model."),
    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .isInt({ min: 1900, max: 2100 })
      .withMessage("Please provide a valid year."),
    body("inv_description").trim().escape().notEmpty().withMessage("Please provide a description."),
    body("inv_image").trim().escape().notEmpty().withMessage("Please provide an image path."),
    body("inv_thumbnail").trim().escape().notEmpty().withMessage("Please provide a thumbnail path."),
    body("inv_price")
      .trim()
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Please provide a valid price."),
    body("inv_miles")
      .trim()
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Please provide mileage as a number."),
    body("inv_color").trim().escape().notEmpty().withMessage("Please provide the vehicle color."),
    body("classification_id")
      .trim()
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("Please select a classification."),
  ]
}

/* ******************************
 * Check classification data and return errors or continue
 * ***************************** */
invValidate.checkClassData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      classification_name,
    })
    return
  }
  next()
}

/* ******************************
 * Check inventory data and return errors or continue
 * ***************************** */
invValidate.checkInventoryData = async (req, res, next) => {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors,
      classificationSelect,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    })
    return
  }
  next()
}

module.exports = invValidate
