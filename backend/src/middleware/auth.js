export const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key']
  const expectedKey = process.env.API_KEY || 'change-me-in-production'
  
  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid or missing API key'
    })
  }
  
  next()
}
