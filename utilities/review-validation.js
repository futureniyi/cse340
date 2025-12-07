const { body, validationResult } = require("express-validator")
const utilities = require(".")
const validate = {}

/*  **********************************
  *  Review Validation Rules
  * ********************************* */
validate.reviewRules = () => {
  return [
    body("inv_id").trim().notEmpty().isInt().withMessage("Invalid vehicle."),
    body("rating").trim().notEmpty().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5."),
    body("comment")
      .trim()
      .notEmpty()
      .isLength({ min: 2, max: 1000 })
      .withMessage("Please provide a review between 2 and 1000 characters."),
  ]
}

/* ******************************
 * Check review data and return errors or continue
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
  const { inv_id, rating, comment } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    // Keep minimal info; redirect back to detail with flash and sticky data
    req.flash("notice", errors.array().map(e => e.msg).join(" "))
    return res.redirect(`/inv/detail/${inv_id}`)
  }
  next()
}

module.exports = validate
