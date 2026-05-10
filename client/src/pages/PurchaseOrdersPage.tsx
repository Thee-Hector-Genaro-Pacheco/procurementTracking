import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_PURCHASE_ORDERS, GET_PROCUREMENT_REQUESTS, GET_VENDORS, CREATE_PURCHASE_ORDER, UPDATE_PO_STATUS } from '../graphql/queries'

export const PurchaseOrdersPage: React.FC = () => {
  const { data: poData, loading: poLoading, error: poError } = useQuery(GET_PURCHASE_ORDERS)
  const { data: reqData } = useQuery(GET_PROCUREMENT_REQUESTS)
  const { data: vendorsData } = useQuery(GET_VENDORS)

  const [createPO, { loading: createPOLoading, error: createPOError }] = useMutation(CREATE_PURCHASE_ORDER, {
    refetchQueries: [{ query: GET_PURCHASE_ORDERS }, { query: GET_PROCUREMENT_REQUESTS }],
  })
  const [updatePOStatus] = useMutation(UPDATE_PO_STATUS, {
    refetchQueries: [{ query: GET_PURCHASE_ORDERS }],
  })

  const [poFormData, setPoFormData] = useState({
    procurementRequestId: '',
    vendorId: '',
    orderDate: '',
    expectedDeliveryDate: '',
    notes: '',
  })

  const [poFilter, setPoFilter] = useState('ALL')

  const handlePoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setPoFormData({ ...poFormData, [e.target.name]: e.target.value })
  }

  const handlePoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const input = {
        ...poFormData,
        orderDate: poFormData.orderDate || null,
        expectedDeliveryDate: poFormData.expectedDeliveryDate || null,
      }
      await createPO({ variables: { input } })
      setPoFormData({
        procurementRequestId: '',
        vendorId: '',
        orderDate: '',
        expectedDeliveryDate: '',
        notes: '',
      })
    } catch (err) {
      console.error("Failed to create PO", err)
    }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updatePOStatus({ variables: { input: { id, status } } })
    } catch (err) {
      console.error("Failed to update PO status", err)
    }
  }

  const filteredPOs = poData?.purchaseOrders?.filter((po: any) => poFilter === 'ALL' || po.status === poFilter) || []

  return (
    <div>
      <h2>Purchase Orders</h2>
      <div className="form-container" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--social-bg)', borderRadius: '8px' }}>
        <h3>Create Purchase Order</h3>
        {createPOError && <p style={{ color: 'red' }}>Error: {createPOError.message}</p>}
        
        <form onSubmit={handlePoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Procurement Request *</label>
              <select name="procurementRequestId" value={poFormData.procurementRequestId} onChange={handlePoChange} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}>
                <option value="" disabled>Select a request</option>
                {reqData?.procurementRequests?.map((req: any) => (
                  <option key={req.id} value={req.id}>
                    {req.title} - {req.department} ({req.status})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Vendor *</label>
              <select name="vendorId" value={poFormData.vendorId} onChange={handlePoChange} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}>
                <option value="" disabled>Select a vendor</option>
                {vendorsData?.vendors?.map((v: any) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.vendorType} - {v.qualificationStatus})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Order Date</label>
              <input type="date" name="orderDate" value={poFormData.orderDate} onChange={handlePoChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Expected Delivery Date</label>
              <input type="date" name="expectedDeliveryDate" value={poFormData.expectedDeliveryDate} onChange={handlePoChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Notes</label>
            <textarea name="notes" value={poFormData.notes} onChange={handlePoChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={createPOLoading} style={{ padding: '0.75rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}>
            {createPOLoading ? 'Creating PO...' : 'Create Purchase Order'}
          </button>
        </form>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>All Purchase Orders</h3>
        <div>
          <label style={{ marginRight: '0.5rem' }}>Filter by Status:</label>
          <select value={poFilter} onChange={e => setPoFilter(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <option value="ALL">All</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ISSUED">ISSUED</option>
            <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
            <option value="PARTIALLY_RECEIVED">PARTIALLY_RECEIVED</option>
            <option value="RECEIVED">RECEIVED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
      </div>

      {poLoading && <p>Loading purchase orders...</p>}
      {poError && <p style={{ color: 'red' }}>Failed to load purchase orders: {poError.message}</p>}
      {filteredPOs.length === 0 && !poLoading && <p>No purchase orders found.</p>}
      
      <div style={{ display: 'grid', gap: '1rem' }}>
        {filteredPOs.map((po: any) => (
          <div key={po.id} className="po-card" style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>{po.poNumber}</h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--text)' }}>
                  Req: {po.procurementRequest.title} | Vendor: <strong>{po.vendor.name}</strong>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select 
                  value={po.status} 
                  onChange={(e) => handleStatusUpdate(po.id, e.target.value)}
                  style={{ padding: '0.25rem 0.5rem', background: 'var(--code-bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.85rem' }}
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="ISSUED">ISSUED</option>
                  <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                  <option value="PARTIALLY_RECEIVED">PARTIALLY_RECEIVED</option>
                  <option value="RECEIVED">RECEIVED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text)', marginBottom: '1rem' }}>
              <span>Order Date: {po.orderDate ? new Date(po.orderDate).toLocaleDateString() : 'N/A'}</span>
              <span>Expected: {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : 'N/A'}</span>
              <span>Subtotal: <strong>${po.subtotal.toFixed(2)}</strong></span>
            </div>
            
            <div style={{ padding: '1rem', background: 'var(--social-bg)', borderRadius: '6px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>PO Line Items</h4>
              {po.items && po.items.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.85rem' }}>
                  {po.items.map((item: any) => (
                    <li key={item.id} style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{item.quantity} {item.unitOfMeasure || 'EA'}</strong> x {item.itemName} 
                        {item.partNumber && ` (PN: ${item.partNumber})`}
                        {item.manufacturer && ` [${item.manufacturer}]`}
                        {item.unitCost !== null && ` - @ $${item.unitCost.toFixed(2)}`}
                        {item.lineTotal !== null && ` = $${item.lineTotal.toFixed(2)}`}
                      </div>
                      <div style={{ marginLeft: '1rem', padding: '0.2rem 0.5rem', background: item.isFullyReceived ? '#d4edda' : 'var(--border)', color: item.isFullyReceived ? '#155724' : 'var(--text)', borderRadius: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        Recv: {item.quantityReceived} / {item.quantity}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text)' }}>No items.</p>
              )}
            </div>

            {po.receipts && po.receipts.length > 0 && (
              <div style={{ padding: '1rem', background: 'var(--social-bg)', borderRadius: '6px', marginTop: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Receipt Logs</h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.8rem', color: 'var(--text)' }}>
                  {po.receipts.map((rec: any) => {
                    const matchedItem = po.items.find((i: any) => i.id === rec.purchaseOrderItemId);
                    return (
                      <li key={rec.id} style={{ marginBottom: '0.25rem' }}>
                        <strong>{rec.quantityReceived}x</strong> {matchedItem ? matchedItem.itemName : 'Unknown'} received on {new Date(rec.receivedDate).toLocaleDateString()}
                        {rec.receivedBy && ` by ${rec.receivedBy}`}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {po.notes && <p style={{ margin: '1rem 0 0 0', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text)' }}>Notes: {po.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
