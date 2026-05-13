import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_PROCUREMENT_REQUESTS, CREATE_PROCUREMENT_REQUEST, CREATE_REQUEST_ITEM, REVIEW_PROCUREMENT_REQUEST } from '../graphql/queries'
import { useUser } from '../contexts/UserContext'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { FormField } from '../components/ui/FormField'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/shared/StatusBadge'
import { LoadingState } from '../components/shared/LoadingState'
import { EmptyState } from '../components/ui/EmptyState'

export const RequestsPage = () => {
  const { currentUser } = useUser();
  const { loading, data } = useQuery<any>(GET_PROCUREMENT_REQUESTS)
  const [createProcurementRequest, { loading: createLoading, error: createError }] = useMutation<any>(CREATE_PROCUREMENT_REQUEST, {
    refetchQueries: [{ query: GET_PROCUREMENT_REQUESTS }],
  })
  const [createRequestItem, { loading: createItemLoading, error: createItemError }] = useMutation<any>(CREATE_REQUEST_ITEM, {
    refetchQueries: [{ query: GET_PROCUREMENT_REQUESTS }],
  })
  const [reviewRequest, { loading: reviewLoading }] = useMutation<any>(REVIEW_PROCUREMENT_REQUEST, {
    refetchQueries: [{ query: GET_PROCUREMENT_REQUESTS }],
  })

  const [formData, setFormData] = useState({ title: '', description: '', department: '', priority: 'MEDIUM', neededByDate: '' })
  const [itemFormData, setItemFormData] = useState({ procurementRequestId: '', itemName: '', description: '', quantity: 1, unitOfMeasure: '', estimatedUnitCost: '', partNumber: '', manufacturer: '', notes: '' })
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value })
  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setItemFormData({ ...itemFormData, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const input = {
        ...formData,
        neededByDate: formData.neededByDate || null,
        requestedById: currentUser?.id || null,
      }
      await createProcurementRequest({ variables: { input } })
      setFormData({ title: '', description: '', department: '', priority: 'MEDIUM', neededByDate: '' })
    } catch (err) {}
  }

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const input = {
        ...itemFormData,
        quantity: parseInt(itemFormData.quantity.toString(), 10),
        estimatedUnitCost: itemFormData.estimatedUnitCost ? parseFloat(itemFormData.estimatedUnitCost) : null,
      }
      await createRequestItem({ variables: { input } })
      setItemFormData({ procurementRequestId: '', itemName: '', description: '', quantity: 1, unitOfMeasure: '', estimatedUnitCost: '', partNumber: '', manufacturer: '', notes: '' })
    } catch (err) {}
  }

  const handleReview = async (id: string, decision: string) => {
    if (!currentUser) return;
    try {
      await reviewRequest({ variables: { input: { id, approverId: currentUser.id, decision, rejectionReason: rejectionReason[id] || null } } })
    } catch (err) {}
  }

  const filteredRequests = data?.procurementRequests?.filter((r: any) => statusFilter === 'ALL' || r.status === statusFilter) || []
  const approvalQueue = data?.procurementRequests?.filter((r: any) => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW') || []

  return (
    <div className="page">
      <PageHeader title="Procurement Requests" subtitle="Submit and track requests for goods and services" />

      {currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'APPROVER') && approvalQueue.length > 0 && (
        <section className="section" style={{ background: 'var(--color-surface-soft)', padding: '1.5rem', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-warning)' }}>
          <h2 className="section-header" style={{ color: 'var(--color-warning)' }}>Action Required: Pending Approvals</h2>
          <div className="card-grid">
            {approvalQueue.map((req: any) => (
              <Card key={req.id} style={{ borderLeft: '4px solid var(--color-warning)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{req.title}</h3>
                  <StatusBadge status={req.status} />
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
                  Requested by: {req.requestedBy?.name || 'Unknown'} ({req.department})
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {req.status === 'SUBMITTED' && (
                    <Button variant="secondary" onClick={() => handleReview(req.id, 'UNDER_REVIEW')} disabled={reviewLoading}>
                      Mark Under Review
                    </Button>
                  )}
                  {req.status === 'UNDER_REVIEW' && (
                    <>
                      <Button variant="primary" onClick={() => handleReview(req.id, 'APPROVED')} disabled={reviewLoading}>
                        Approve Request
                      </Button>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input 
                          type="text" 
                          placeholder="Reason for rejection" 
                          value={rejectionReason[req.id] || ''} 
                          onChange={(e) => setRejectionReason({ ...rejectionReason, [req.id]: e.target.value })}
                          style={{ flex: 1, padding: '0.4rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-button)' }}
                        />
                        <Button variant="danger" onClick={() => handleReview(req.id, 'REJECTED')} disabled={reviewLoading}>
                          Reject
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {currentUser && (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px' }}>
            <Card className="form-card" style={{ margin: 0 }}>
              <h3 className="section-header">Submit New Request</h3>
              {createError && <div className="error-message">Error: {createError.message}</div>}
              
              <form onSubmit={handleSubmit} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <FormField label="Title *">
                  <input name="title" value={formData.title} onChange={handleChange} required />
                </FormField>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <FormField label="Department *" className="form-grid-full" style={{ flex: 1 }}>
                    <input name="department" value={formData.department} onChange={handleChange} required />
                  </FormField>
                  <FormField label="Priority *" className="form-grid-full" style={{ flex: 1 }}>
                    <select name="priority" value={formData.priority} onChange={handleChange} required>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </FormField>
                </div>
                
                <FormField label="Needed By Date">
                  <input type="date" name="neededByDate" value={formData.neededByDate} onChange={handleChange} />
                </FormField>
                
                <FormField label="Description">
                  <textarea name="description" value={formData.description} onChange={handleChange} />
                </FormField>

                <Button type="submit" disabled={createLoading}>
                  {createLoading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </form>
            </Card>
          </div>

          <div style={{ flex: '1 1 400px' }}>
            <Card className="form-card" style={{ margin: 0 }}>
              <h3 className="section-header">Add Line Item</h3>
              {createItemError && <div className="error-message">Error: {createItemError.message}</div>}
              
              <form onSubmit={handleItemSubmit} className="form-grid">
                <FormField label="Select Request *" className="form-grid-full">
                  <select name="procurementRequestId" value={itemFormData.procurementRequestId} onChange={handleItemChange} required>
                    <option value="" disabled>Select a request</option>
                    {data?.procurementRequests?.filter((r: any) => r.status === 'DRAFT' || r.status === 'SUBMITTED').map((req: any) => (
                      <option key={req.id} value={req.id}>{req.title} ({req.department})</option>
                    ))}
                  </select>
                </FormField>
                
                <FormField label="Item Name *">
                  <input name="itemName" value={itemFormData.itemName} onChange={handleItemChange} required />
                </FormField>
                
                <FormField label="Quantity *">
                  <input type="number" min="1" name="quantity" value={itemFormData.quantity} onChange={handleItemChange} required />
                </FormField>
                
                <FormField label="Unit of Measure *">
                  <input name="unitOfMeasure" placeholder="e.g. Each, Box, kg" value={itemFormData.unitOfMeasure} onChange={handleItemChange} required />
                </FormField>
                
                <FormField label="Estimated Unit Cost">
                  <input type="number" step="0.01" min="0" name="estimatedUnitCost" value={itemFormData.estimatedUnitCost} onChange={handleItemChange} />
                </FormField>

                <FormField label="Part Number">
                  <input name="partNumber" value={itemFormData.partNumber} onChange={handleItemChange} />
                </FormField>
                
                <FormField label="Manufacturer">
                  <input name="manufacturer" value={itemFormData.manufacturer} onChange={handleItemChange} />
                </FormField>

                <FormField label="Description" className="form-grid-full">
                  <textarea name="description" value={itemFormData.description} onChange={handleItemChange} />
                </FormField>

                <div className="form-grid-full">
                  <Button type="submit" disabled={createItemLoading || !itemFormData.procurementRequestId}>
                    {createItemLoading ? 'Adding...' : 'Add Item'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

      <section className="section" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <h2 className="section-header" style={{ borderBottom: 'none', padding: 0, margin: 0 }}>All Requests</h2>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.4rem', borderRadius: 'var(--radius-button)', border: '1px solid var(--color-border)' }}>
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="ORDERED">Ordered</option>
            <option value="RECEIVED">Received</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {loading ? (
          <LoadingState />
        ) : filteredRequests.length === 0 ? (
          <EmptyState message="No requests found." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredRequests.map((req: any) => (
              <Card key={req.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-accent-dark)' }}>{req.title}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>{req.department} • Priority: {req.priority}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                    <StatusBadge status={req.status} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                      Requested by: {req.requestedBy?.name || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  {req.description && <p style={{ margin: '0 0 0.5rem 0' }}>{req.description}</p>}
                  {req.neededByDate && <p style={{ margin: 0, color: 'var(--color-danger)' }}>Needed by: {new Date(req.neededByDate).toLocaleDateString()}</p>}
                  {req.rejectionReason && <p style={{ margin: '0.5rem 0 0 0', color: 'var(--color-danger)', fontWeight: 600 }}>Rejection Reason: {req.rejectionReason}</p>}
                </div>

                <div style={{ background: 'var(--color-surface-soft)', padding: '1rem', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Line Items ({req.items?.length || 0})</h4>
                  {req.items?.length === 0 ? (
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>No line items added yet.</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                      {req.items.map((item: any) => (
                        <div key={item.id} style={{ fontSize: '0.85rem', background: 'var(--color-surface)', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                          <strong style={{ display: 'block', color: 'var(--color-accent-dark)' }}>{item.itemName}</strong>
                          <div>Qty: {item.quantity} {item.unitOfMeasure}</div>
                          {item.estimatedUnitCost && <div>Est. Cost: ${item.estimatedUnitCost.toFixed(2)}</div>}
                          {item.manufacturer && <div>Mfg: {item.manufacturer}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
