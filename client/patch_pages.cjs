const fs = require('fs');
const path = require('path');

const write = (file, content) => {
  fs.writeFileSync(path.join('src/pages', file), content.trim());
};

write('LoginPage.tsx', `
import { useState } from "react";
import type { SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";

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
    <div className="page" style={{ maxWidth: "480px", margin: "4rem auto", width: "100%" }}>
      <Card>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", margin: "0 0 0.5rem 0", color: "var(--color-accent-dark)" }}>Procurement Tracking</h1>
          <p style={{ color: "var(--color-muted)", margin: 0, fontSize: "0.95rem" }}>Log in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <FormField label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </FormField>

          <FormField label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </FormField>

          {error && <div className="error-message">{error}</div>}

          <Button type="submit" disabled={loading} style={{ marginTop: "0.5rem" }}>
            {loading ? "Authenticating..." : "Sign In"}
          </Button>
        </form>
      </Card>

      <div style={{ marginTop: "2rem", fontSize: "0.85rem", color: "var(--color-muted)", textAlign: "center" }}>
        <p style={{ marginBottom: "1rem" }}><strong>Demo Accounts</strong> (Password: DemoPass123!)</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <span><strong>Admin:</strong> jordan.reyes@example.com</span>
          <span><strong>Approver:</strong> morgan.blake@example.com</span>
          <span><strong>Buyer:</strong> taylor.chen@example.com</span>
          <span><strong>Receiver:</strong> riley.brooks@example.com</span>
          <span><strong>Requester:</strong> casey.morgan@example.com</span>
        </div>
      </div>
    </div>
  );
}
`);

console.log("LoginPage updated.");
