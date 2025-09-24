import { useState } from 'react'
import api from '../api'

function TradeForm({ symbols, prices, onTradeSuccess }) {
  const [formData, setFormData] = useState({
    symbol: symbols || '',
    side: 'buy',
    quantity: 1
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await api.post('/orders', formData)
      setMessage('Trade executed successfully!')
      onTradeSuccess()
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to execute trade')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const currentPrice = prices[formData.symbol]
  const estimatedCost = currentPrice ? (currentPrice * formData.quantity).toFixed(2) : 0

  return (
    <form onSubmit={handleSubmit} className="trade-form">
      <div className="form-group">
        <label>Symbol:</label>
        <select
          name="symbol"
          value={formData.symbol}
          onChange={handleChange}
          required
        >
          {symbols.map(symbol => (
            <option key={symbol} value={symbol}>{symbol}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Side:</label>
        <select
          name="side"
          value={formData.side}
          onChange={handleChange}
          required
        >
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
      </div>

      <div className="form-group">
        <label>Quantity:</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="1"
          max="1000"
          required
        />
      </div>

      {currentPrice && (
        <div style={{ margin: '1rem 0', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
          <p><strong>Current Price:</strong> ${currentPrice.toFixed(4)}</p>
          <p><strong>Estimated Cost:</strong> ${estimatedCost}</p>
        </div>
      )}

      <button 
        type="submit" 
        className={`btn ${formData.side === 'buy' ? 'btn-success' : 'btn-danger'}`}
        disabled={loading || !currentPrice}
      >
        {loading ? 'Executing...' : `${formData.side.toUpperCase()} ${formData.symbol}`}
      </button>

      {message && (
        <div className={message.includes('success') ? 'success' : 'error'}>
          {message}
        </div>
      )}
    </form>
  )
}

export default TradeForm