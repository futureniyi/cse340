const pool = require("../database/")

/* ***************************
 *  Create new review
 * ************************** */
async function createReview(inv_id, account_id, rating, comment) {
  try {
    const sql = `INSERT INTO public.reviews (inv_id, account_id, rating, comment)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`
    const result = await pool.query(sql, [inv_id, account_id, rating, comment])
    return result.rows[0] || null
  } catch (error) {
    throw error
  }
}

/* ***************************
 *  Update existing review
 * ************************** */
async function updateReview(review_id, rating, comment) {
  try {
    const sql = `UPDATE public.reviews
                 SET rating = $1, comment = $2, updated_at = NOW()
                 WHERE review_id = $3
                 RETURNING *`
    const result = await pool.query(sql, [rating, comment, review_id])
    return result.rows[0] || null
  } catch (error) {
    throw error
  }
}

/* ***************************
 *  Delete review
 * ************************** */
async function deleteReview(review_id) {
  try {
    const sql = "DELETE FROM public.reviews WHERE review_id = $1 RETURNING review_id"
    const result = await pool.query(sql, [review_id])
    return result.rowCount
  } catch (error) {
    throw error
  }
}

/* ***************************
 *  Get reviews for inventory item
 * ************************** */
async function getReviewsByInvId(inv_id) {
  try {
    const sql = `SELECT r.review_id, r.inv_id, r.account_id, r.rating, r.comment,
                        r.created_at, r.updated_at,
                        a.account_firstname, a.account_lastname, a.account_type
                 FROM public.reviews r
                 JOIN public.account a ON r.account_id = a.account_id
                 WHERE r.inv_id = $1
                 ORDER BY r.created_at DESC`
    const result = await pool.query(sql, [inv_id])
    return result.rows
  } catch (error) {
    throw error
  }
}

/* ***************************
 *  Get review by id
 * ************************** */
async function getReviewById(review_id) {
  try {
    const sql = `SELECT r.review_id, r.inv_id, r.account_id, r.rating, r.comment,
                        r.created_at, r.updated_at,
                        a.account_firstname, a.account_lastname, a.account_type
                 FROM public.reviews r
                 JOIN public.account a ON r.account_id = a.account_id
                 WHERE r.review_id = $1`
    const result = await pool.query(sql, [review_id])
    return result.rows[0] || null
  } catch (error) {
    throw error
  }
}

/* ***************************
 *  Get a user's review for an item
 * ************************** */
async function getReviewByUserAndInv(account_id, inv_id) {
  try {
    const sql = `SELECT r.review_id, r.inv_id, r.account_id, r.rating, r.comment,
                        r.created_at, r.updated_at
                 FROM public.reviews r
                 WHERE r.account_id = $1 AND r.inv_id = $2`
    const result = await pool.query(sql, [account_id, inv_id])
    return result.rows[0] || null
  } catch (error) {
    throw error
  }
}

/* ***************************
 *  Get rating summary for inventory item
 * ************************** */
async function getRatingSummaryByInvId(inv_id) {
  try {
    const sql = `SELECT
                   COALESCE(AVG(rating), 0)::numeric(10,2) AS average_rating,
                   COUNT(*)::int AS review_count
                 FROM public.reviews
                 WHERE inv_id = $1`
    const result = await pool.query(sql, [inv_id])
    return result.rows[0] || { average_rating: 0, review_count: 0 }
  } catch (error) {
    throw error
  }
}

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getReviewsByInvId,
  getReviewById,
  getReviewByUserAndInv,
  getRatingSummaryByInvId,
}
