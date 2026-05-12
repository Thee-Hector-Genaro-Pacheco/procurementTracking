const fs = require('fs');
const path = require('path');

const write = (file, content) => {
  fs.writeFileSync(path.join('src/pages', file), content.trim());
};

write('DashboardPage.tsx', `
import { useQuery } from '@apollo/client/react'
import { GET_PROCUREMENT_REQUESTS, GET_PURCHASE_ORDERS, GET_VENDORS } from '../graphql/queries'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { LoadingState } from '../components/shared/LoadingState'

export const DashboardPage = () => {
  const { data: reqData, loading: reqLoading } = useQuery<any>(GET_PROCUREMENT_REQUESTS)
  const { data: poData, loading: poLoading } = useQuery<any>(GET_PURCHASE_ORDERS)
  const { data: vendorData, loading: vendorLoading } = useQuery<any>(GET_VENDORS)

  if (reqLoading || poLoading || vendorLoading) {
    return <LoadingState message="Loading dashboard metrics..." />
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

  const Metric = ({ title, value }: { title: string, value: number }) => (
    <Card className="metric-card">
      <div className="metric-card-title">{title}</div>
      <div className="metric-card-value">{value}</div>
    </Card>
  )

  return (
    <div className="page">
      <PageHeader title="Operational Overview" subtitle="High-level metrics across all procurement functions" />
      
      <section className="section">
        <h2 className="section-header">Procurement Requests</h2>
        <div className="dashboard-grid">
          <Metric title="Total Requests" value={totalRequests} />
          <Metric title="Open Requests" value={openRequests} />
          <Metric title="Ordered" value={orderedRequests} />
          <Metric title="Received" value={receivedRequests} />
        </div>
      </section>

      <section className="section">
        <h2 className="section-header">Purchase Orders</h2>
        <div className="dashboard-grid">
          <Metric title="Total POs" value={totalPOs} />
          <Metric title="Partially Received" value={partiallyReceivedPOs} />
          <Metric title="Fully Received" value={fullyReceivedPOs} />
        </div>
      </section>

      <section className="section">
        <h2 className="section-header">Vendors</h2>
        <div className="dashboard-grid">
          <Metric title="Total Vendors" value={totalVendors} />
          <Metric title="Preferred Vendors" value={preferredVendors} />
        </div>
      </section>
    </div>
  )
}
`);

console.log("DashboardPage updated.");
