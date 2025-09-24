import { useState, useEffect } from 'react'
import api from '../api'
import PriceCard from '../components/PriceCard'
import TradeForm from '../components/TradeForm'

function Dashboard() {
  const [user, setUser] = useState(null)
  const [prices, setPrices] = useState({})
  const [openTrades, setOpenTrades] = useState([])
  const [loading, setLoading] = useState(true)

  const symbols = ['EURUSD', 'GBPUSD', 'BTCUSD']

  useEffect(() => {
    fetchUserData()
    fetchPrices()
    fetchOpenTrades()
    
    // Update prices every 10 seconds
    const interval = setInterval(fetchPrices, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await api.get('/me')
      setUser(response.data)
    } catch (err) {
      console.error('Failed to fetch user data:', err)
    }
  }

  const fetchPrices = async () => {
    try {
      const pricePromises = symbols.map(symbol => 
        api.get(`/prices?symbol=${symbol}`)
      )
      const responses = await Promise.all(pricePromises)
      
      const newPrices = {}
      responses.forEach((response, index) => {
        newPrices[symbols[index]] = response.data.price
      })
      
      setPrices(newPrices)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch prices:', err)
      setLoading(false)
    }
  }

  const fetchOpenTrades = async () => {
    try {
      const response = await api.get('/trades?status=open')
      setOpenTrades(response.data)
    } catch (err) {
      console.error('Failed to fetch open trades:', err)
    }
  }

  const handleTradeSuccess = () => {
    fetchUserData()
    fetchOpenTrades()
  }

  const handleCloseTrade = async (tradeId) => {
    try {
      await api.post(`/orders/close/${tradeId}`)
      fetchUserData()
      fetchOpenTrades()
    } catch (err) {
      console.error('Failed to close trade:', err)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h2>Trading Dashboard</h2>
      
      {user && (
        <div className="balance">
          Balance: ${user.balance.toFixed(2)}
        </div>
      )}
      
      <div className="dashboard-grid">
        <div className="card">
          <h3>Market Prices</h3>
          {symbols.map(symbol => (
            <PriceCard 
              key={symbol}
              symbol={symbol}
              price={prices[symbol]}
            />
          ))}
        </div>
        
        <div className="card">
          <h3>Place Trade</h3>
          <TradeForm 
            symbols={symbols}
            prices={prices}
            onTradeSuccess={handleTradeSuccess}
          />
        </div>
        
        <div className="card">
          <h3>Open Trades</h3>
          {openTrades.length === 0 ? (
            <p>No open trades</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Side</th>
                  <th>Entry Price</th>
                  <th>Quantity</th>
                  <th>Current P/L</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {openTrades.map(trade => {
                  const currentPrice = prices[trade.symbol] || trade.entryPrice
                  const pnl = trade.side === 'buy' 
                    ? (currentPrice - trade.entryPrice) * trade.quantity
                    : (trade.entryPrice - currentPrice) * trade.quantity
                  
                  return (
                    <tr key={trade._id}>
                      <td>{trade.symbol}</td>
                      <td>{trade.side.toUpperCase()}</td>
                      <td>${trade.entryPrice.toFixed(4)}</td>
                      <td>{trade.quantity}</td>
                      <td style={{ color: pnl >= 0 ? 'green' : 'red' }}>
                        ${pnl.toFixed(2)}
                      </td>
                      <td>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleCloseTrade(trade._id)}
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard