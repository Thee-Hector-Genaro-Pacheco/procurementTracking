import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_PROCUREMENT_REQUESTS, CREATE_PROCUREMENT_REQUEST, CREATE_REQUEST_ITEM } from '../graphql/queries'

export const RequestsPage: React.FC = () => {
  const { loading, error, data } = useQuery(GET_PROCUREMENT_REQUESTS)
  const [createProcurementRequest, { loading: createLoading, error: createError }] = useMutation(CREATE_PROCUREMENT_REQUEST, {
    refetchQueries: [{ query: GET_PROCUREMENT_REQUESTS }],
  })
  const [createRequestItem, { loading: createItemLoading, error: createItemError }] = useMutation(CREATE_REQUEST_ITEM, {
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

  const filteredRequests = data?.procurementRequests?.filter((req: any) => statusFilter === 'ALL' || req.status === statusFilter) || []

  return (
    <div>
      <h2>Procurement Requests</h2>
      
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
          <button type="submit" disabled={createLoading} style={{ padding: '0.75rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}>
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
              <span style={{ padding: '0.25rem 0.5rem', background: 'var(--code-bg)', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>{req.status}</span>
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
