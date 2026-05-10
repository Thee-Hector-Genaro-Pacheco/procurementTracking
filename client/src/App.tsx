import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import ProtectedRoute from "./components/ProtectRoute";

import { DashboardPage } from "./pages/DashboardPage";
import { RequestsPage } from "./pages/RequestsPage";
import { VendorsPage } from "./pages/VendorsPage";
import { PurchaseOrdersPage } from "./pages/PurchaseOrdersPage";
import { ReceivingPage } from "./pages/ReceivingPage";
import { UsersPage } from "./pages/UsersPage";
import LoginPage from "./pages/LoginPage";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="vendors" element={<VendorsPage />} />
          <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="receiving" element={<ReceivingPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;