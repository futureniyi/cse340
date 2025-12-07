const reviewModel = require("../models/review-model")

/* ***************************
 *  Add or update a review (one per user per vehicle)
 * ************************** */
async function submitReview(req, res, next) {
  const account_id = res.locals?.accountData?.account_id
  const { inv_id, rating, comment } = req.body

  if (!account_id) {
    req.flash("notice", "Please log in to leave a review.")
    return res.redirect(`/account/login`)
  }

  try {
    const existing = await reviewModel.getReviewByUserAndInv(account_id, inv_id)
    if (existing) {
      await reviewModel.updateReview(existing.review_id, rating, comment)
      req.flash("notice", "Your review has been updated.")
    } else {
      await reviewModel.createReview(inv_id, account_id, rating, comment)
      req.flash("notice", "Thank you for your review.")
    }
    return res.redirect(`/inv/detail/${inv_id}`)
  } catch (error) {
    req.flash("notice", "Sorry, we could not save your review.")
    return res.redirect(`/inv/detail/${inv_id}`)
  }
}

/* ***************************
 *  Delete a review
 * ************************** */
async function deleteReview(req, res, next) {
  const account_id = res.locals?.accountData?.account_id
  const account_type = res.locals?.accountData?.account_type
  const { review_id, inv_id } = req.body

  if (!account_id) {
    req.flash("notice", "Please log in to manage reviews.")
    return res.redirect(`/account/login`)
  }

  try {
    const review = await reviewModel.getReviewById(review_id)
    if (!review) {
      req.flash("notice", "Review not found.")
      return res.redirect(`/inv/detail/${inv_id}`)
    }

    const isOwner = review.account_id === Number(account_id)
    const isModerator = account_type === "Employee" || account_type === "Admin"
    if (!isOwner && !isModerator) {
      req.flash("notice", "You do not have permission to delete this review.")
      return res.redirect(`/inv/detail/${inv_id}`)
    }

    await reviewModel.deleteReview(review_id)
    req.flash("notice", "Review deleted.")
    return res.redirect(`/inv/detail/${review.inv_id}`)
  } catch (error) {
    req.flash("notice", "Sorry, deleting the review failed.")
    return res.redirect(`/inv/detail/${inv_id || ""}`)
  }
}

module.exports = { submitReview, deleteReview }
