function PriceCard({ symbol, price }) {
  return (
    <div className="price-card">
      <h4>{symbol}</h4>
      <div className="price-value">
        {price ? `$${price.toFixed(4)}` : 'Loading...'}
      </div>
    </div>
  )
}

export default PriceCard