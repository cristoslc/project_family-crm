export const getHealth = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error.message
    })
  }
}
