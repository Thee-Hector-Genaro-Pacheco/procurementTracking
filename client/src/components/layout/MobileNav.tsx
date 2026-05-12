import { NavLink } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { currentUser, logout } = useUser();

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      <div 
        className={`mobile-nav-backdrop ${isOpen ? 'open' : ''}`} 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <nav className={`mobile-nav ${isOpen ? 'mobile-nav-open' : ''}`}>
        <NavLink to="/" className="mobile-nav-link" onClick={onClose}>Dashboard</NavLink>
        <NavLink to="/requests" className="mobile-nav-link" onClick={onClose}>Requests</NavLink>
        <NavLink to="/vendors" className="mobile-nav-link" onClick={onClose}>Vendors</NavLink>
        <NavLink to="/purchase-orders" className="mobile-nav-link" onClick={onClose}>Purchase Orders</NavLink>
        <NavLink to="/receiving" className="mobile-nav-link" onClick={onClose}>Receiving</NavLink>
        <NavLink to="/users" className="mobile-nav-link" onClick={onClose}>Users</NavLink>

        {currentUser && (
          <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--color-border)", marginTop: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--color-text)" }}>{currentUser.name}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--color-muted)" }}>{currentUser.role}</div>
            </div>
            <button className="btn btn-secondary" onClick={handleLogout} style={{ width: "100%" }}>
              Logout
            </button>
          </div>
        )}
      </nav>
    </>
  );
}