import { query } from "../config/db.js";

export const getMe = async (req, res) => {
    res.json({
        success: true,
        message: 'Protected route accessed.',
        user: req.user,
    })
}

export const getAllUsers = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, email 
       FROM users 
       WHERE is_deleted = false
       ORDER BY id DESC`
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      users: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, name, email 
       FROM users 
       WHERE id = $1 AND is_deleted = false`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};