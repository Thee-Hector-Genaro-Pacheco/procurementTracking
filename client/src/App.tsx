import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client/core'
import './App.css'

const HEALTH_CHECK = gql`
  query HealthCheck {
    healthCheck
  }
`

function App() {
  const { loading, error, data } = useQuery<{ healthCheck: string }>(HEALTH_CHECK)

  return (
    <div className="container" style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Procurement Tracking</h1>
      
      <div className="api-status" style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>API Status</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
        {data && <p style={{ color: 'green' }}>{data.healthCheck}</p>}
      </div>
    </div>
  )
}

export default App
