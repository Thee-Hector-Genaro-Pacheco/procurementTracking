import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_PURCHASE_ORDERS, GET_PROCUREMENT_REQUESTS, RECEIVE_PO_ITEM } from '../graphql/queries'
import { useUser } from '../contexts/UserContext'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { FormField } from '../components/ui/FormField'
import { Button } from '../components/ui/Button'
import { LoadingState } from '../components/shared/LoadingState'

export const ReceivingPage = () => {
  const { currentUser } = useUser()
  const { data: poData, loading: poLoading, error: poError } = useQuery<any>(GET_PURCHASE_ORDERS)

  const [receivePOItem, { loading: receiveLoading, error: receiveError }] = useMutation<any>(RECEIVE_PO_ITEM, {
    refetchQueries: [{ query: GET_PURCHASE_ORDERS }, { query: GET_PROCUREMENT_REQUESTS }],
  })

  const [receiveFormData, setReceiveFormData] = useState({
    purchaseOrderId: '', purchaseOrderItemId: '', quantityReceived: 1, receivedDate: '', receivedBy: '', notes: '',
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
      setReceiveFormData({ purchaseOrderId: '', purchaseOrderItemId: '', quantityReceived: 1, receivedDate: '', receivedBy: '', notes: '' })
    } catch (err) {}
  }

  const selectedPOForReceiving = poData?.purchaseOrders?.find((po: any) => po.id === receiveFormData.purchaseOrderId);

  if (poLoading) return <div className="page"><LoadingState /></div>

  return (
    <div className="page">
      <PageHeader title="Receiving" subtitle="Log and track incoming shipments against Purchase Orders" />

      {currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'RECEIVER') ? (
        <Card className="form-card">
          <h3 className="section-header">Log Item Receipt</h3>
          {receiveError && <div className="error-message">Error: {receiveError.message}</div>}
          {poError && <div className="error-message">Error loading POs: {poError.message}</div>}
          
          <form onSubmit={handleReceiveSubmit} className="form-grid">
            <FormField label="Purchase Order *">
              <select name="purchaseOrderId" value={receiveFormData.purchaseOrderId} onChange={handleReceiveChange} required>
                <option value="" disabled>Select a PO</option>
                {poData?.purchaseOrders?.filter((po: any) => ['APPROVED', 'ISSUED', 'ACKNOWLEDGED', 'PARTIALLY_RECEIVED'].includes(po.status)).map((po: any) => (
                  <option key={po.id} value={po.id}>{po.poNumber} - {po.vendor.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="PO Line Item *">
              <select name="purchaseOrderItemId" value={receiveFormData.purchaseOrderItemId} onChange={handleReceiveChange} required disabled={!receiveFormData.purchaseOrderId}>
                <option value="" disabled>Select an item</option>
                {selectedPOForReceiving?.items.filter((item: any) => !item.isFullyReceived).map((item: any) => (
                  <option key={item.id} value={item.id}>{item.itemName} (Remaining: {item.quantityRemaining})</option>
                ))}
              </select>
            </FormField>
            
            <FormField label="Quantity Received *">
              <input type="number" name="quantityReceived" min="1" value={receiveFormData.quantityReceived} onChange={handleReceiveChange} required />
            </FormField>
            
            <FormField label="Received Date">
              <input type="date" name="receivedDate" value={receiveFormData.receivedDate} onChange={handleReceiveChange} />
            </FormField>

            <FormField label="Received By">
              <input name="receivedBy" value={receiveFormData.receivedBy} onChange={handleReceiveChange} />
            </FormField>
            
            <FormField label="Notes / Condition">
              <input name="notes" value={receiveFormData.notes} onChange={handleReceiveChange} />
            </FormField>

            <div className="form-grid-full">
              <Button type="submit" disabled={receiveLoading}>
                {receiveLoading ? 'Logging Receipt...' : 'Log Receipt'}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card>
          <p style={{ margin: 0, color: 'var(--color-muted)', textAlign: 'center' }}>
            Only Receivers or Administrators can log item receipts.
          </p>
        </Card>
      )}

      <section className="section">
        <h2 className="section-header">Recent Receipts Log</h2>
        <div className="card-grid">
          {poData?.purchaseOrders?.flatMap((po: any) => po.receipts).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20).map((receipt: any) => (
            <Card key={receipt.id}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div><strong>PO:</strong> {poData.purchaseOrders.find((po: any) => po.id === receipt.purchaseOrderId)?.poNumber}</div>
                <div><strong>Item:</strong> {poData.purchaseOrders.find((po: any) => po.id === receipt.purchaseOrderId)?.items.find((i: any) => i.id === receipt.purchaseOrderItemId)?.itemName}</div>
                <div><strong>Qty:</strong> {receipt.quantityReceived}</div>
                <div><strong>Date:</strong> {new Date(receipt.receivedDate).toLocaleDateString()}</div>
                {receipt.receivedBy && <div><strong>By:</strong> {receipt.receivedBy}</div>}
                {receipt.notes && <div><strong>Notes:</strong> {receipt.notes}</div>}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}