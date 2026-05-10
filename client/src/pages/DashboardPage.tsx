import React from 'react'
import { useQuery } from '@apollo/client/react'
import { GET_PROCUREMENT_REQUESTS, GET_PURCHASE_ORDERS, GET_VENDORS } from '../graphql/queries'

export const DashboardPage: React.FC = () => {
  const { data: reqData, loading: reqLoading } = useQuery<any>(GET_PROCUREMENT_REQUESTS)
  const { data: poData, loading: poLoading } = useQuery<any>(GET_PURCHASE_ORDERS)
  const { data: vendorData, loading: vendorLoading } = useQuery<any>(GET_VENDORS)

  if (reqLoading || poLoading || vendorLoading) {
    return <p>Loading dashboard metrics...</p>
  }

  const requests = reqData?.procurementRequests || []
  const pos = poData?.purchaseOrders || []
  const vendors = vendorData?.vendors || []

  // Calculate Request Metrics
  const totalRequests = requests.length
  const openRequests = requests.filter((r: any) => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW' || r.status === 'DRAFT').length
  const orderedRequests = requests.filter((r: any) => r.status === 'ORDERED').length
  const receivedRequests = requests.filter((r: any) => r.status === 'RECEIVED').length

  // Calculate Vendor Metrics
  const totalVendors = vendors.length
  const preferredVendors = vendors.filter((v: any) => v.qualificationStatus === 'PREFERRED').length

  // Calculate PO Metrics
  const totalPOs = pos.length
  const partiallyReceivedPOs = pos.filter((po: any) => po.status === 'PARTIALLY_RECEIVED').length
  const fullyReceivedPOs = pos.filter((po: any) => po.status === 'RECEIVED').length

  const Card = ({ title, value, color }: { title: string, value: number, color?: string }) => (
    <div style={{ background: 'var(--social-bg)', padding: '1.5rem', borderRadius: '8px', borderLeft: `4px solid ${color || 'var(--accent)'}`, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--text)' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{value}</p>
    </div>
  )

  return (
    <div>
      <h2>Dashboard Overview</h2>
      
      <h3 style={{ marginTop: '2rem' }}>Procurement Requests</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <Card title="Total Requests" value={totalRequests} color="#4A90E2" />
        <Card title="Open Requests" value={openRequests} color="#F5A623" />
        <Card title="Ordered" value={orderedRequests} color="#9013FE" />
        <Card title="Received" value={receivedRequests} color="#7ED321" />
      </div>

      <h3 style={{ marginTop: '3rem' }}>Purchase Orders</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <Card title="Total POs" value={totalPOs} color="#4A90E2" />
        <Card title="Partially Received" value={partiallyReceivedPOs} color="#F8E71C" />
        <Card title="Fully Received" value={fullyReceivedPOs} color="#7ED321" />
      </div>

      <h3 style={{ marginTop: '3rem' }}>Vendors</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <Card title="Total Vendors" value={totalVendors} color="#4A90E2" />
        <Card title="Preferred Vendors" value={preferredVendors} color="#F5A623" />
      </div>
    </div>
  )
}
