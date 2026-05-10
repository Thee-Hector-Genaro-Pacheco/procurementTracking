import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { RequestsPage } from './pages/RequestsPage'
import { VendorsPage } from './pages/VendorsPage'
import { PurchaseOrdersPage } from './pages/PurchaseOrdersPage'
import { ReceivingPage } from './pages/ReceivingPage'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="vendors" element={<VendorsPage />} />
          <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="receiving" element={<ReceivingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
