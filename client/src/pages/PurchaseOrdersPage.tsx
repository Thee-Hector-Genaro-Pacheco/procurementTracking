import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_PURCHASE_ORDERS, GET_PROCUREMENT_REQUESTS, GET_VENDORS, CREATE_PURCHASE_ORDER, UPDATE_PO_STATUS, APPROVE_PURCHASE_ORDER, DENY_PURCHASE_ORDER } from '../graphql/queries'
import { useUser } from '../contexts/UserContext'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { FormField } from '../components/ui/FormField'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/shared/StatusBadge'
import { LoadingState } from '../components/shared/LoadingState'
import { EmptyState } from '../components/ui/EmptyState'

export const PurchaseOrdersPage = () => {
  const { currentUser } = useUser()
  const { data: poData, loading: poLoading } = useQuery<any>(GET_PURCHASE_ORDERS)
  const { data: reqData } = useQuery<any>(GET_PROCUREMENT_REQUESTS)
  const { data: vendorsData } = useQuery<any>(GET_VENDORS)

  const [createPO, { loading: createPOLoading, error: createPOError }] = useMutation<any>(CREATE_PURCHASE_ORDER, {
    refetchQueries: [{ query: GET_PURCHASE_ORDERS }, { query: GET_PROCUREMENT_REQUESTS }]
  })
  const [updatePOStatus] = useMutation<any>(UPDATE_PO_STATUS, {
    refetchQueries: [{ query: GET_PURCHASE_ORDERS }]
  })

  const [approvePO] = useMutation<any>(APPROVE_PURCHASE_ORDER, {
    refetchQueries: [{ query: GET_PURCHASE_ORDERS }]
  })
  const [denyPO] = useMutation<any>(DENY_PURCHASE_ORDER, {
    refetchQueries: [{ query: GET_PURCHASE_ORDERS }]
  })

  const handleApprove = async (id: string) => {
    if (!currentUser) return;
    try {
      await approvePO({ variables: { id, approverId: currentUser.id } });
    } catch (err) {
      alert("Failed to approve PO");
    }
  }

  const handleDeny = async (id: string) => {
    if (!currentUser) return;
    const reason = window.prompt("Enter reason for denial:");
    if (reason === null) return;
    try {
      await denyPO({ variables: { id, approverId: currentUser.id, reason: reason || "No reason provided" } });
    } catch (err) {
      alert("Failed to deny PO");
    }
  }

  const [poFormData, setPoFormData] = useState({ procurementRequestId: '', vendorId: '', notes: '' })

  const handlePoChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    setPoFormData({ ...poFormData, [e.target.name]: e.target.value })
  }

  const handlePoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createPO({ variables: { input: poFormData } })
      setPoFormData({ procurementRequestId: '', vendorId: '', notes: '' })
    } catch (err) {}
  }

  return (
    <div className="page">
      <PageHeader title="Purchase Orders" subtitle="Manage external vendor purchasing commitments" />

      {currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'BUYER') && (
        <Card className="form-card">
          <h3 className="section-header">Create Purchase Order</h3>
          {createPOError && <div className="error-message">Error: {createPOError.message}</div>}
          
          <form onSubmit={handlePoSubmit} className="form-grid">
            <FormField label="Procurement Request (APPROVED only) *">
              <select name="procurementRequestId" value={poFormData.procurementRequestId} onChange={handlePoChange} required>
                <option value="" disabled>Select an approved request</option>
                {reqData?.procurementRequests?.filter((req: any) => req.status === 'APPROVED').map((req: any) => (
                  <option key={req.id} value={req.id}>{req.title} - {req.department}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Vendor *">
              <select name="vendorId" value={poFormData.vendorId} onChange={handlePoChange} required>
                <option value="" disabled>Select a vendor</option>
                {vendorsData?.vendors?.map((v: any) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.qualificationStatus})</option>
                ))}
              </select>
            </FormField>

            <FormField label="Notes" className="form-grid-full">
              <textarea name="notes" value={poFormData.notes} onChange={handlePoChange} />
            </FormField>

            <div className="form-grid-full">
              <Button type="submit" disabled={createPOLoading}>
                {createPOLoading ? 'Creating PO...' : 'Create Purchase Order'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <section className="section">
        <h2 className="section-header">Active Purchase Orders</h2>
        
        {poLoading ? (
          <LoadingState />
        ) : poData?.purchaseOrders?.length === 0 ? (
          <EmptyState message="No purchase orders found." />
        ) : (
          <div className="card-grid">
            {poData?.purchaseOrders?.map((po: any) => (
              <Card key={po.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-accent-dark)' }}>{po.poNumber}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Req: {po.procurementRequest.title}</div>
                  </div>
                  <StatusBadge status={po.status} />
                </div>

                <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
                  <div><strong>Vendor:</strong> {po.vendor.name}</div>
                  <div><strong>Subtotal:</strong> ${po.subtotal.toFixed(2)}</div>
                  <div><strong>Vendor:</strong> {po.vendor.name}</div>
                  <div><strong>Subtotal:</strong> ${po.subtotal.toFixed(2)}</div>
                  <div><strong>Date:</strong> {new Date(po.createdAt).toLocaleDateString()}</div>
                  {po.denialReason && <div style={{ color: 'var(--color-danger)', marginTop: '0.5rem' }}><strong>Denial Reason:</strong> {po.denialReason}</div>}
                </div>

                <div style={{ background: 'var(--color-surface-soft)', padding: '0.75rem', borderRadius: 'var(--radius-card)', marginBottom: '1rem' }}>
                  <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Line Items</strong>
                  {po.items.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>No items</span>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                      {po.items.map((item: any) => (
                        <li key={item.id}>
                          {item.description} ({item.quantity} {item.unitOfMeasure}) - ${item.unitPrice.toFixed(2)}
                          {item.quantityReceived > 0 && <span style={{ color: 'var(--color-success)', marginLeft: '0.5rem' }}>(Rec: {item.quantityReceived})</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'APPROVER') && po.status === 'PENDING_APPROVAL' && (
                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginBottom: '1rem' }}>
                    <Button variant="primary" onClick={() => handleApprove(po.id)}>Approve</Button>
                    <Button variant="danger" onClick={() => handleDeny(po.id)}>Deny</Button>
                  </div>
                )}
                {currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'BUYER') && po.status !== 'RECEIVED' && po.status !== 'CLOSED' && po.status !== 'CANCELLED' && po.status !== 'PENDING_APPROVAL' && po.status !== 'DENIED' && (
                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                    {po.status === 'APPROVED' && <Button variant="secondary" onClick={() => updatePOStatus({ variables: { input: { id: po.id, status: 'ISSUED' } } })}>Issue PO</Button>}
                    {po.status === 'DRAFT' && <Button variant="secondary" onClick={() => updatePOStatus({ variables: { input: { id: po.id, status: 'ISSUED' } } })}>Issue PO</Button>}
                    {po.status === 'ISSUED' && <Button variant="secondary" onClick={() => updatePOStatus({ variables: { input: { id: po.id, status: 'ACKNOWLEDGED' } } })}>Mark Acknowledged</Button>}
                    <Button variant="danger" onClick={() => updatePOStatus({ variables: { input: { id: po.id, status: 'CANCELLED' } } })}>Cancel PO</Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
