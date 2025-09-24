import { useState, useEffect } from 'react'
import api from '../api'

function History() {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTrades: 0,
    totalProfit: 0,
    winningTrades: 0,
    losingTrades: 0
  })

  useEffect(() => {
    fetchTradeHistory()
  }, [])

  const fetchTradeHistory = async () => {
    try {
      const response = await api.get('/trades')
      const allTrades = response.data
      setTrades(allTrades)
      
      // Calculate stats
      const closedTrades = allTrades.filter(trade => trade.status === 'closed')
      const totalProfit = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
      const winningTrades = closedTrades.filter(trade => (trade.pnl || 0) > 0).length
      const losingTrades = closedTrades.filter(trade => (trade.pnl || 0) < 0).length
      
      setStats({
        totalTrades: closedTrades.length,
        totalProfit,
        winningTrades,
        losingTrades
      })
      
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch trade history:', err)
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h2>Trade History</h2>
      
      <div className="dashboard-grid">
        <div className="card">
          <h3>Trading Statistics</h3>
          <p><strong>Total Trades:</strong> {stats.totalTrades}</p>
          <p><strong>Total P/L:</strong> 
            <span style={{ color: stats.totalProfit >= 0 ? 'green' : 'red' }}>
              ${stats.totalProfit.toFixed(2)}
            </span>
          </p>
          <p><strong>Winning Trades:</strong> {stats.winningTrades}</p>
          <p><strong>Losing Trades:</strong> {stats.losingTrades}</p>
          <p><strong>Win Rate:</strong> {
            stats.totalTrades > 0 
              ? ((stats.winningTrades / stats.totalTrades) * 100).toFixed(1)
              : 0
          }%</p>
        </div>
      </div>
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>All Trades</h3>
        {trades.length === 0 ? (
          <p>No trades found</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Symbol</th>
                <th>Side</th>
                <th>Entry Price</th>
                <th>Exit Price</th>
                <th>Quantity</th>
                <th>P/L</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.map(trade => (
                <tr key={trade._id}>
                  <td>{new Date(trade.createdAt).toLocaleDateString()}</td>
                  <td>{trade.symbol}</td>
                  <td>{trade.side.toUpperCase()}</td>
                  <td>${trade.entryPrice.toFixed(4)}</td>
                  <td>{trade.exitPrice ? `$${trade.exitPrice.toFixed(4)}` : '-'}</td>
                  <td>{trade.quantity}</td>
                  <td style={{ color: (trade.pnl || 0) >= 0 ? 'green' : 'red' }}>
                    {trade.pnl ? `$${trade.pnl.toFixed(2)}` : '-'}
                  </td>
                  <td>
                    <span style={{ 
                      color: trade.status === 'open' ? 'orange' : 'blue',
                      fontWeight: 'bold'
                    }}>
                      {trade.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default History