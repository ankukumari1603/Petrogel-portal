import './StatCard.css'

function StatCard({ label, value, accent = 'blue', critical = false, icon: Icon }) {
  return (
    <div className={`stat-card stat-card-${accent}${critical ? ' stat-card-critical' : ''}`}>
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        {Icon && (
          <span className="stat-card-icon">
            <Icon />
          </span>
        )}
      </div>
      <span className="stat-card-value">{value}</span>
    </div>
  )
}

export default StatCard
