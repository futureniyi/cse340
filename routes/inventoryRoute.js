// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")
const reviewValidate = require("../utilities/review-validation")

// Route to build inventory management view
router.get("/", utilities.checkEmployeeAdmin, utilities.handleErrors(invController.buildManagement))

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to build vehicle detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId))

// Review routes
router.post(
  "/review",
  utilities.checkLogin,
  reviewValidate.reviewRules(),
  reviewValidate.checkReviewData,
  utilities.handleErrors(reviewController.submitReview)
)
router.post(
  "/review/delete",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.deleteReview)
)

// Route to return inventory by classification as JSON
router.get("/getInventory/:classification_id", utilities.checkEmployeeAdmin, utilities.handleErrors(invController.getInventoryJSON))

// Route to show edit inventory view
router.get("/edit/:invId", utilities.checkEmployeeAdmin, utilities.handleErrors(invController.buildEditInventory))

// Route to show delete inventory confirmation view
router.get("/delete/:invId", utilities.checkEmployeeAdmin, utilities.handleErrors(invController.buildDeleteInventory))

// Route to show add classification view
router.get("/add-classification", utilities.checkEmployeeAdmin, utilities.handleErrors(invController.buildAddClassification))

// Process new classification
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassData,
  utilities.checkEmployeeAdmin,
  utilities.handleErrors(invController.addClassification)
)

// Route to show add inventory view
router.get(
  "/add-inventory",
  utilities.checkEmployeeAdmin,
  utilities.handleErrors(invController.buildAddInventory)
)

// Process new inventory item
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.checkEmployeeAdmin,
  utilities.handleErrors(invController.addInventory)
)

// Process inventory update
router.post(
  "/update",
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.checkEmployeeAdmin,
  utilities.handleErrors(invController.updateInventory)
)

// Process inventory delete
router.post("/delete", utilities.checkEmployeeAdmin, utilities.handleErrors(invController.deleteInventory))

module.exports = router;
