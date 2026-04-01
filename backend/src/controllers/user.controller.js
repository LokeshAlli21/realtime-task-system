export const getMe = async (req, res) => {
    res.json({
        success: true,
        message: 'Protected route accessed.',
        user: req.user,
    })
}