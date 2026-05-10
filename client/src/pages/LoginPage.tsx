import { useState } from "react";
import type { SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useUser();

  const [email, setEmail] = useState("jordan.reyes@example.com");
  const [password, setPassword] = useState("DemoPass123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

 async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: "480px", margin: "4rem auto", padding: "2rem" }}>
      <h1>Procurement Tracking Login</h1>

      <p style={{ color: "#666" }}>
        All demo accounts use password: <strong>DemoPass123!</strong>
      </p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            style={{ width: "100%", padding: "0.75rem" }}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            style={{ width: "100%", padding: "0.75rem" }}
          />
        </label>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.75rem",
            background: "var(--accent)",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <section style={{ marginTop: "2rem", fontSize: "0.9rem" }}>
        <h2>Demo Accounts</h2>
        <p>Admin: jordan.reyes@example.com</p>
        <p>Approver: morgan.blake@example.com</p>
        <p>Buyer: taylor.chen@example.com</p>
        <p>Receiver: riley.brooks@example.com</p>
        <p>Requester: casey.morgan@example.com</p>
      </section>
    </main>
  );
}