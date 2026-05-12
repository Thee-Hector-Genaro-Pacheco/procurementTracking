import { Link, NavLink } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

interface HeaderProps {
  onToggleMobileNav: () => void;
  isMobileNavOpen: boolean;
}

export function Header({ onToggleMobileNav, isMobileNavOpen }: HeaderProps) {
  const { currentUser, logout } = useUser();

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link to="/" className="app-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          ProcurementTracker
        </Link>

        <nav className="desktop-nav">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/requests">Requests</NavLink>
          <NavLink to="/vendors">Vendors</NavLink>
          <NavLink to="/purchase-orders">Purchase Orders</NavLink>
          <NavLink to="/receiving">Receiving</NavLink>
          <NavLink to="/users">Users</NavLink>

          {currentUser && (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "1px solid var(--color-border)", paddingLeft: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{currentUser.name}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>{currentUser.role}</span>
              </div>
              <button className="btn btn-secondary" onClick={logout} style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}>
                Logout
              </button>
            </div>
          )}
        </nav>

        <button 
          className="mobile-nav-toggle" 
          onClick={onToggleMobileNav}
          aria-label="Toggle Navigation"
          aria-expanded={isMobileNavOpen}
        >
          {isMobileNavOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}