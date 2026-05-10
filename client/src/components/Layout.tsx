import React from 'react'
import { Link, Outlet } from 'react-router-dom'

export const Layout: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--accent)' }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>ProcurementTracker</Link>
          </h1>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 'bold' }}>Dashboard</Link>
            <Link to="/requests" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 'bold' }}>Requests</Link>
            <Link to="/vendors" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 'bold' }}>Vendors</Link>
            <Link to="/purchase-orders" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 'bold' }}>Purchase Orders</Link>
            <Link to="/receiving" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 'bold' }}>Receiving</Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <Outlet />
      </main>

      <footer style={{ padding: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.9rem' }}>
        &copy; {new Date().getFullYear()} Procurement Tracking App
      </footer>
    </div>
  )
}
