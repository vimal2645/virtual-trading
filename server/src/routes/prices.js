import express from 'express'

const router = express.Router()

// Mock price data (replace with real API later)
const mockPrices = {
  EURUSD: 1.0850,
  GBPUSD: 1.2650,
  BTCUSD: 43250.00
}

// Simple price fluctuation
const getPriceWithFluctuation = (basePrice) => {
  const fluctuation = (Math.random() - 0.5) * 0.01 // ±0.5% fluctuation
  return basePrice * (1 + fluctuation)
}

// Get current price for a symbol
router.get('/', async (req, res) => {
  try {
    const { symbol } = req.query

    if (!symbol) {
      return res.status(400).json({ message: 'Symbol is required' })
    }

    const symbolUpper = symbol.toUpperCase()

    // For now, use mock data with fluctuation
    if (mockPrices[symbolUpper]) {
      const currentPrice = getPriceWithFluctuation(mockPrices[symbolUpper])
      
      return res.json({
        symbol: symbolUpper,
        price: currentPrice,
        timestamp: new Date().toISOString()
      })
    }

    res.status(404).json({ message: 'Symbol not found' })
  } catch (error) {
    console.error('Price fetch error:', error)
    res.status(500).json({ message: 'Failed to fetch price' })
  }
})

export default router