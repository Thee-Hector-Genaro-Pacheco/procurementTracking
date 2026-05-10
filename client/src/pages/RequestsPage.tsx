import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_PROCUREMENT_REQUESTS, CREATE_PROCUREMENT_REQUEST, CREATE_REQUEST_ITEM, REVIEW_PROCUREMENT_REQUEST } from '../graphql/queries'
import { useUser } from '../contexts/UserContext'

export const RequestsPage: React.FC = () => {
  const { currentUser } = useUser();
  const { loading, error, data } = useQuery<any>(GET_PROCUREMENT_REQUESTS)
  const [createProcurementRequest, { loading: createLoading, error: createError }] = useMutation<any>(CREATE_PROCUREMENT_REQUEST, {
    refetchQueries: [{ query: GET_PROCUREMENT_REQUESTS }],
  })
  const [createRequestItem, { loading: createItemLoading, error: createItemError }] = useMutation<any>(CREATE_REQUEST_ITEM, {
    refetchQueries: [{ query: GET_PROCUREMENT_REQUESTS }],
  })
  const [reviewRequest, { loading: reviewLoading }] = useMutation<any>(REVIEW_PROCUREMENT_REQUEST, {
    refetchQueries: [{ query: GET_PROCUREMENT_REQUESTS }],
  })

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    priority: 'MEDIUM',
    neededByDate: '',
  })

  const [itemFormData, setItemFormData] = useState({
    procurementRequestId: '',
    itemName: '',
    description: '',
    quantity: 1,
    unitOfMeasure: '',
    estimatedUnitCost: '',
    partNumber: '',
    manufacturer: '',
    notes: '',
  })

  const [statusFilter, setStatusFilter] = useState('ALL')
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setItemFormData({ ...itemFormData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const input = {
        ...formData,
        neededByDate: formData.neededByDate || null,
        requestedById: currentUser?.id || null,
      }
      await createProcurementRequest({ variables: { input } })
      setFormData({
        title: '',
        description: '',
        department: '',
        priority: 'MEDIUM',
        neededByDate: '',
      })
    } catch (err) {
      console.error("Failed to create request", err)
    }
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
      setItemFormData({
        procurementRequestId: '',
        itemName: '',
        description: '',
        quantity: 1,
        unitOfMeasure: '',
        estimatedUnitCost: '',
        partNumber: '',
        manufacturer: '',
        notes: '',
      })
    } catch (err) {
      console.error("Failed to create request item", err)
    }
  }

  const handleReview = async (id: string, decision: string) => {
    if (!currentUser) return;
    try {
      await reviewRequest({
        variables: {
          input: {
            id,
            approverId: currentUser.id,
            decision,
            rejectionReason: decision === 'REJECT' ? rejectionReason[id] : null,
          }
        }
      });
      if (decision === 'REJECT') {
        setRejectionReason({ ...rejectionReason, [id]: '' });
      }
    } catch (err) {
      console.error("Failed to review request", err);
    }
  }

  const filteredRequests = data?.procurementRequests?.filter((req: any) => statusFilter === 'ALL' || req.status === statusFilter) || []

  const canApprove = currentUser?.role === 'ADMIN' || currentUser?.role === 'APPROVER';
  const pendingRequests = data?.procurementRequests?.filter((req: any) => req.status === 'SUBMITTED' || req.status === 'UNDER_REVIEW') || [];

  return (
    <div>
      <h2>Procurement Requests</h2>
      
      {!currentUser && (
        <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '1rem' }}>
          Please select a user from the header dropdown to create or approve requests.
        </div>
      )}

      {/* Approvals Section */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--card-bg)', borderRadius: '8px', borderLeft: '4px solid #f39c12', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>Approvals</h3>
        {canApprove ? (
          pendingRequests.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {pendingRequests.map((req: any) => (
                <div key={req.id} style={{ padding: '1rem', background: 'var(--social-bg)', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>{req.title} <span style={{ fontSize: '0.8rem', color: '#f39c12' }}>[{req.status}]</span></h4>
                    <span style={{ fontSize: '0.85rem' }}>By: {req.requestedBy?.name || 'Unknown'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    {req.status === 'SUBMITTED' && (
                      <button onClick={() => handleReview(req.id, 'UNDER_REVIEW')} disabled={reviewLoading} style={{ padding: '0.5rem 1rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Mark Under Review</button>
                    )}
                    <button onClick={() => handleReview(req.id, 'APPROVE')} disabled={reviewLoading} style={{ padding: '0.5rem 1rem', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        placeholder="Rejection reason..." 
                        value={rejectionReason[req.id] || ''} 
                        onChange={(e) => setRejectionReason({ ...rejectionReason, [req.id]: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                      />
                      <button onClick={() => handleReview(req.id, 'REJECT')} disabled={reviewLoading} style={{ padding: '0.5rem 1rem', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No requests pending approval.</p>
          )
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>You do not have permission to approve requests. Must be ADMIN or APPROVER.</p>
        )}
      </div>

      <div className="form-container" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--social-bg)', borderRadius: '8px' }}>
        <h3>Create New Request</h3>
        {createError && <p style={{ color: 'red' }}>Error: {createError.message}</p>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title *</label>
            <input name="title" value={formData.title} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Department *</label>
              <input name="department" value={formData.department} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Needed By Date</label>
            <input type="date" name="neededByDate" value={formData.neededByDate} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={createLoading || !currentUser} style={{ padding: '0.75rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem', opacity: !currentUser ? 0.5 : 1 }}>
            {createLoading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>All Requests</h3>
        <div>
          <label style={{ marginRight: '0.5rem' }}>Filter by Status:</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <option value="ALL">All</option>
            <option value="DRAFT">DRAFT</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="APPROVED">APPROVED</option>
            <option value="ORDERED">ORDERED</option>
            <option value="RECEIVED">RECEIVED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {loading && <p>Loading requests...</p>}
      {error && <p style={{ color: 'red' }}>Failed to load requests: {error.message}</p>}
      {filteredRequests.length === 0 && !loading && <p>No requests found.</p>}
      
      <div style={{ display: 'grid', gap: '1rem' }}>
        {filteredRequests.map((req: any) => (
          <div key={req.id} className="request-card" style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>{req.title}</h3>
              <span style={{ padding: '0.25rem 0.5rem', background: req.status === 'APPROVED' ? '#d4edda' : req.status === 'REJECTED' ? '#f8d7da' : 'var(--code-bg)', color: req.status === 'APPROVED' ? '#155724' : req.status === 'REJECTED' ? '#721c24' : 'inherit', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>{req.status}</span>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.9rem', marginBottom: '1rem', background: 'var(--social-bg)', padding: '0.5rem', borderRadius: '4px' }}>
              <span><strong>Requested By:</strong> {req.requestedBy?.name || 'N/A'}</span>
              <span><strong>Approved By:</strong> {req.approvedBy?.name || 'N/A'}</span>
              {req.approvedAt && <span><strong>Approved At:</strong> {new Date(req.approvedAt).toLocaleDateString()}</span>}
              {req.rejectionReason && <span style={{ color: '#e74c3c' }}><strong>Reason:</strong> {req.rejectionReason}</span>}
            </div>

            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text)' }}>Department: {req.department}</p>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text)', marginBottom: '1rem' }}>
              <span>Priority: {req.priority}</span>
              <span>Needed: {req.neededByDate ? new Date(req.neededByDate).toLocaleDateString() : 'Not specified'}</span>
              <span>Created: {new Date(req.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div style={{ padding: '1rem', background: 'var(--social-bg)', borderRadius: '6px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Line Items</h4>
              {req.items && req.items.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                  {req.items.map((item: any) => (
                    <li key={item.id} style={{ marginBottom: '0.25rem' }}>
                      <strong>{item.quantity}x {item.itemName}</strong> 
                      {item.partNumber && ` (PN: ${item.partNumber})`}
                      {item.estimatedUnitCost && ` - $${item.estimatedUnitCost}/ea`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text)' }}>No items added yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <hr style={{ margin: '3rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />

      <div className="form-container" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--social-bg)', borderRadius: '8px' }}>
        <h3>Add Line Item to Request</h3>
        {createItemError && <p style={{ color: 'red' }}>Error: {createItemError.message}</p>}
        
        <form onSubmit={handleItemSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Procurement Request *</label>
            <select name="procurementRequestId" value={itemFormData.procurementRequestId} onChange={handleItemChange} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}>
              <option value="" disabled>Select a request</option>
              {data?.procurementRequests?.map((req: any) => (
                <option key={req.id} value={req.id}>{req.title}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Item Name *</label>
              <input name="itemName" value={itemFormData.itemName} onChange={handleItemChange} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Quantity *</label>
              <input type="number" name="quantity" min="1" value={itemFormData.quantity} onChange={handleItemChange} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Unit of Measure</label>
              <input name="unitOfMeasure" value={itemFormData.unitOfMeasure} onChange={handleItemChange} placeholder="e.g., EA, PKG, BOX" style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Est. Unit Cost ($)</label>
              <input type="number" step="0.01" name="estimatedUnitCost" value={itemFormData.estimatedUnitCost} onChange={handleItemChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Part Number</label>
              <input name="partNumber" value={itemFormData.partNumber} onChange={handleItemChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Manufacturer</label>
              <input name="manufacturer" value={itemFormData.manufacturer} onChange={handleItemChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description / Notes</label>
            <textarea name="description" value={itemFormData.description} onChange={handleItemChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={createItemLoading} style={{ padding: '0.75rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}>
            {createItemLoading ? 'Adding...' : 'Add Item'}
          </button>
        </form>
      </div>
    </div>
  )
}
