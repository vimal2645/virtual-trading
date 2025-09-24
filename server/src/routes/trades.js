import express from 'express'
import auth from '../middleware/auth.js'
import User from '../models/User.js'
import Trade from '../models/Trade.js'

const router = express.Router()

// Mock price function (same as in prices.js)
const mockPrices = {
  EURUSD: 1.0850,
  GBPUSD: 1.2650,
  BTCUSD: 43250.00
}

const getPriceWithFluctuation = (basePrice) => {
  const fluctuation = (Math.random() - 0.5) * 0.01
  return basePrice * (1 + fluctuation)
}

const getCurrentPrice = (symbol) => {
  const symbolUpper = symbol.toUpperCase()
  if (mockPrices[symbolUpper]) {
    return getPriceWithFluctuation(mockPrices[symbolUpper])
  }
  return null
}

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      email: req.user.email,
      balance: req.user.balance,
      role: req.user.role
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get user's trades
router.get('/trades', auth, async (req, res) => {
  try {
    const { status } = req.query
    const filter = { userId: req.user._id }
    
    if (status) {
      filter.status = status
    }

    const trades = await Trade.find(filter).sort({ createdAt: -1 })
    res.json(trades)
  } catch (error) {
    console.error('Get trades error:', error)
    res.status(500).json({ message: 'Failed to fetch trades' })
  }
})

// Place new order (market order)
router.post('/orders', auth, async (req, res) => {
  try {
    const { symbol, side, quantity } = req.body
    const userId = req.user._id

    // Validate input
    if (!symbol || !side || !quantity) {
      return res.status(400).json({ message: 'Symbol, side, and quantity are required' })
    }

    if (!['buy', 'sell'].includes(side)) {
      return res.status(400).json({ message: 'Side must be buy or sell' })
    }

    if (quantity < 1 || quantity > 1000) {
      return res.status(400).json({ message: 'Quantity must be between 1 and 1000' })
    }

    // Get current price
    const currentPrice = getCurrentPrice(symbol)
    if (!currentPrice) {
      return res.status(400).json({ message: 'Unable to get current price for this symbol' })
    }

    // Calculate cost
    const cost = currentPrice * quantity

    // Check if user has sufficient balance (for buy orders)
    if (side === 'buy' && req.user.balance < cost) {
      return res.status(400).json({ message: 'Insufficient balance' })
    }

    // Create trade
    const trade = new Trade({
      userId,
      symbol: symbol.toUpperCase(),
      side,
      quantity,
      entryPrice: currentPrice
    })

    await trade.save()

    // Update user balance
    const balanceChange = side === 'buy' ? -cost : cost
    await User.findByIdAndUpdate(userId, {
      $inc: { balance: balanceChange }
    })

    res.status(201).json({
      message: 'Order executed successfully',
      trade,
      executionPrice: currentPrice
    })
  } catch (error) {
    console.error('Place order error:', error)
    res.status(500).json({ message: 'Failed to execute order' })
  }
})

// Close a trade
router.post('/orders/close/:tradeId', auth, async (req, res) => {
  try {
    const { tradeId } = req.params
    const userId = req.user._id

    // Find the trade
    const trade = await Trade.findOne({ _id: tradeId, userId, status: 'open' })
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found or already closed' })
    }

    // Get current price
    const currentPrice = getCurrentPrice(trade.symbol)
    if (!currentPrice) {
      return res.status(400).json({ message: 'Unable to get current price' })
    }

    // Calculate P/L
    let pnl
    if (trade.side === 'buy') {
      pnl = (currentPrice - trade.entryPrice) * trade.quantity
    } else {
      pnl = (trade.entryPrice - currentPrice) * trade.quantity
    }

    // Update trade
    trade.exitPrice = currentPrice
    trade.status = 'closed'
    trade.pnl = pnl
    trade.closedAt = new Date()
    await trade.save()

    // Update user balance (add the P/L and return the original investment for buy orders)
    let balanceChange = pnl
    if (trade.side === 'buy') {
      balanceChange += currentPrice * trade.quantity // Return the current value
    }

    await User.findByIdAndUpdate(userId, {
      $inc: { balance: balanceChange }
    })

    res.json({
      message: 'Trade closed successfully',
      trade,
      pnl
    })
  } catch (error) {
    console.error('Close trade error:', error)
    res.status(500).json({ message: 'Failed to close trade' })
  }
})

export default router