import { Link, Outlet, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

export const Layout = () => {
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        fontFamily: "sans-serif",
      }}
    >
      <header
        style={{
          background: "var(--card-bg)",
          borderBottom: "1px solid var(--border)",
          padding: "1rem 2rem",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "1.5rem", color: "var(--accent)" }}>
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              ProcurementTracker
            </Link>
          </h1>

          <nav style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link to="/" style={{ textDecoration: "none", fontWeight: "bold" }}>
              Dashboard
            </Link>
            <Link to="/requests" style={{ textDecoration: "none", fontWeight: "bold" }}>
              Requests
            </Link>
            <Link to="/vendors" style={{ textDecoration: "none", fontWeight: "bold" }}>
              Vendors
            </Link>
            <Link to="/purchase-orders" style={{ textDecoration: "none", fontWeight: "bold" }}>
              Purchase Orders
            </Link>
            <Link to="/receiving" style={{ textDecoration: "none", fontWeight: "bold" }}>
              Receiving
            </Link>
            <Link to="/users" style={{ textDecoration: "none", fontWeight: "bold" }}>
              Users
            </Link>
          </nav>

          {currentUser && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "0.9rem" }}>
                Logged in as{" "}
                <strong>
                  {currentUser.name} ({currentUser.role})
                </strong>
              </span>

              <button
                onClick={handleLogout}
                style={{
                  padding: "0.5rem 0.75rem",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  cursor: "pointer",
                  background: "white",
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main
        style={{
          flex: 1,
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
          padding: "2rem",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;