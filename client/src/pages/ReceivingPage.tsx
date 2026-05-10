import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_PURCHASE_ORDERS, GET_PROCUREMENT_REQUESTS, RECEIVE_PO_ITEM } from '../graphql/queries'

export const ReceivingPage: React.FC = () => {
  const { data: poData, loading: poLoading, error: poError } = useQuery<any>(GET_PURCHASE_ORDERS)

  const [receivePOItem, { loading: receiveLoading, error: receiveError }] = useMutation<any>(RECEIVE_PO_ITEM, {
    refetchQueries: [{ query: GET_PURCHASE_ORDERS }, { query: GET_PROCUREMENT_REQUESTS }],
  })

  const [receiveFormData, setReceiveFormData] = useState({
    purchaseOrderId: '',
    purchaseOrderItemId: '',
    quantityReceived: 1,
    receivedDate: '',
    receivedBy: '',
    notes: '',
  })

  const handleReceiveChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setReceiveFormData({ ...receiveFormData, [e.target.name]: e.target.value })
  }

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const input = {
        ...receiveFormData,
        quantityReceived: parseInt(receiveFormData.quantityReceived.toString(), 10),
        receivedDate: receiveFormData.receivedDate || null,
      }
      await receivePOItem({ variables: { input } })
      setReceiveFormData({
        purchaseOrderId: '',
        purchaseOrderItemId: '',
        quantityReceived: 1,
        receivedDate: '',
        receivedBy: '',
        notes: '',
      })
    } catch (err) {
      console.error("Failed to receive PO item", err)
    }
  }

  const selectedPOForReceiving = poData?.purchaseOrders?.find((po: any) => po.id === receiveFormData.purchaseOrderId);

  return (
    <div>
      <h2>Receiving</h2>
      <div className="form-container" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--social-bg)', borderRadius: '8px' }}>
        <h3>Log Item Receipt</h3>
        {receiveError && <p style={{ color: 'red' }}>Error: {receiveError.message}</p>}
        {poError && <p style={{ color: 'red' }}>Error loading POs: {poError.message}</p>}
        
        <form onSubmit={handleReceiveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Purchase Order *</label>
              <select name="purchaseOrderId" value={receiveFormData.purchaseOrderId} onChange={handleReceiveChange} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}>
                <option value="" disabled>Select a PO</option>
                {poData?.purchaseOrders?.filter((po: any) => po.status !== 'CLOSED' && po.status !== 'CANCELLED' && po.status !== 'RECEIVED').map((po: any) => (
                  <option key={po.id} value={po.id}>
                    {po.poNumber} - {po.vendor.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>PO Line Item *</label>
              <select name="purchaseOrderItemId" value={receiveFormData.purchaseOrderItemId} onChange={handleReceiveChange} required disabled={!receiveFormData.purchaseOrderId} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}>
                <option value="" disabled>Select an item</option>
                {selectedPOForReceiving?.items.filter((item: any) => !item.isFullyReceived).map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.itemName} (Remaining: {item.quantityRemaining})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Quantity Received *</label>
              <input type="number" name="quantityReceived" min="1" value={receiveFormData.quantityReceived} onChange={handleReceiveChange} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Received Date</label>
              <input type="date" name="receivedDate" value={receiveFormData.receivedDate} onChange={handleReceiveChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Received By</label>
              <input name="receivedBy" value={receiveFormData.receivedBy} onChange={handleReceiveChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Notes / Condition</label>
              <input name="notes" value={receiveFormData.notes} onChange={handleReceiveChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
          </div>

          <button type="submit" disabled={receiveLoading || !receiveFormData.purchaseOrderItemId || poLoading} style={{ padding: '0.75rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}>
            {receiveLoading ? 'Logging...' : 'Log Receipt'}
          </button>
        </form>
      </div>
    </div>
  )
}
