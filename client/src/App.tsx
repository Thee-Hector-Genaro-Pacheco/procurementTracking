import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client/core'
import './App.css'

const HEALTH_CHECK = gql`
  query HealthCheck {
    healthCheck
  }
`

const GET_PROCUREMENT_REQUESTS = gql`
  query GetProcurementRequests {
    procurementRequests {
      id
      title
      department
      priority
      status
      neededByDate
      items {
        id
        itemName
        quantity
        partNumber
        estimatedUnitCost
      }
      createdAt
    }
  }
`

const CREATE_PROCUREMENT_REQUEST = gql`
  mutation CreateProcurementRequest($input: CreateProcurementRequestInput!) {
    createProcurementRequest(input: $input) {
      id
      title
      department
      priority
      status
      neededByDate
      createdAt
    }
  }
`

const CREATE_REQUEST_ITEM = gql`
  mutation CreateRequestItem($input: CreateRequestItemInput!) {
    createRequestItem(input: $input) {
      id
      itemName
      quantity
      partNumber
      estimatedUnitCost
    }
  }
`

const GET_PURCHASE_ORDERS = gql`
  query GetPurchaseOrders {
    purchaseOrders {
      id
      poNumber
      status
      orderDate
      expectedDeliveryDate
      subtotal
      notes
      procurementRequest {
        id
        title
      }
      vendor {
        id
        name
      }
      items {
        id
        itemName
        quantity
        unitOfMeasure
        unitCost
        lineTotal
        partNumber
        manufacturer
        quantityReceived
        quantityRemaining
        isFullyReceived
      }
      receipts {
        id
        quantityReceived
        receivedDate
        receivedBy
        notes
      }
      createdAt
    }
  }
`

const RECEIVE_PO_ITEM = gql`
  mutation ReceivePurchaseOrderItem($input: ReceivePurchaseOrderItemInput!) {
    receivePurchaseOrderItem(input: $input) {
      id
      status
    }
  }
`

const CREATE_PURCHASE_ORDER = gql`
  mutation CreatePurchaseOrder($input: CreatePurchaseOrderInput!) {
    createPurchaseOrder(input: $input) {
      id
      poNumber
    }
  }
`

const UPDATE_PO_STATUS = gql`
  mutation UpdatePurchaseOrderStatus($input: UpdatePurchaseOrderStatusInput!) {
    updatePurchaseOrderStatus(input: $input) {
      id
      status
    }
  }
`

const GET_VENDORS = gql`
  query GetVendors {
    vendors {
      id
      name
      contactName
      email
      phone
      address
      notes
      website
      vendorType
      industries
      specialties
      isPreferred
      qualificationStatus
      createdAt
    }
  }
`

const CREATE_VENDOR = gql`
  mutation CreateVendor($input: CreateVendorInput!) {
    createVendor(input: $input) {
      id
      name
      contactName
      email
      phone
      address
      notes
      website
      vendorType
      industries
      specialties
      isPreferred
      qualificationStatus
      createdAt
    }
  }
`

function App() {
  const { loading: healthLoading, error: healthError, data: healthData } = useQuery<{ healthCheck: string }>(HEALTH_CHECK)
  const { loading, error, data } = useQuery<{ procurementRequests: any[] }>(GET_PROCUREMENT_REQUESTS)
  const [createRequest, { loading: createLoading, error: createError }] = useMutation(CREATE_PROCUREMENT_REQUEST, {
    refetchQueries: [{ query: GET_PROCUREMENT_REQUESTS }],
  })

  const { loading: vendorsLoading, error: vendorsError, data: vendorsData } = useQuery<{ vendors: any[] }>(GET_VENDORS)
  const [createVendor, { loading: createVendorLoading, error: createVendorError }] = useMutation(CREATE_VENDOR, {
    refetchQueries: [{ query: GET_VENDORS }],
  })

  const [createRequestItem, { loading: createItemLoading, error: createItemError }] = useMutation(CREATE_REQUEST_ITEM, {
    refetchQueries: [{ query: GET_PROCUREMENT_REQUESTS }],
  })

  const { loading: poLoading, error: poError, data: poData } = useQuery<{ purchaseOrders: any[] }>(GET_PURCHASE_ORDERS)
  const [createPO, { loading: createPOLoading, error: createPOError }] = useMutation(CREATE_PURCHASE_ORDER, {
    refetchQueries: [{ query: GET_PURCHASE_ORDERS }, { query: GET_PROCUREMENT_REQUESTS }],
  })
  const [updatePOStatus] = useMutation(UPDATE_PO_STATUS, {
    refetchQueries: [{ query: GET_PURCHASE_ORDERS }],
  })

  const [receivePOItem, { loading: receiveLoading, error: receiveError }] = useMutation(RECEIVE_PO_ITEM, {
    refetchQueries: [{ query: GET_PURCHASE_ORDERS }, { query: GET_PROCUREMENT_REQUESTS }],
  })

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    priority: 'MEDIUM',
    neededByDate: '',
  })

  const [vendorFormData, setVendorFormData] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    website: '',
    vendorType: 'OTHER',
    industries: '',
    specialties: '',
    isPreferred: false,
    qualificationStatus: 'UNREVIEWED',
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

  const [poFormData, setPoFormData] = useState({
    procurementRequestId: '',
    vendorId: '',
    orderDate: '',
    expectedDeliveryDate: '',
    notes: '',
  })

  const [receiveFormData, setReceiveFormData] = useState({
    purchaseOrderId: '',
    purchaseOrderItemId: '',
    quantityReceived: 1,
    receivedDate: '',
    receivedBy: '',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleVendorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setVendorFormData({ ...vendorFormData, [e.target.name]: value })
  }

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setItemFormData({ ...itemFormData, [e.target.name]: e.target.value })
  }

  const handlePoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setPoFormData({ ...poFormData, [e.target.name]: e.target.value })
  }

  const handleReceiveChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setReceiveFormData({ ...receiveFormData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createRequest({ variables: { input: formData } })
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

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const input = {
        ...vendorFormData,
        industries: vendorFormData.industries ? vendorFormData.industries.split(',').map(s => s.trim()).filter(Boolean) : [],
        specialties: vendorFormData.specialties ? vendorFormData.specialties.split(',').map(s => s.trim()).filter(Boolean) : [],
      }
      await createVendor({ variables: { input } })
      setVendorFormData({
        name: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        website: '',
        vendorType: 'OTHER',
        industries: '',
        specialties: '',
        isPreferred: false,
        qualificationStatus: 'UNREVIEWED',
      })
    } catch (err) {
      console.error("Failed to create vendor", err)
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
    <div className="container" style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Procurement Tracking</h1>
      
      <div className="api-status" style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
        <h2>API Status</h2>
        {healthLoading && <p>Loading API status...</p>}
        {healthError && <p style={{ color: 'red' }}>API Error: {healthError.message}</p>}
        {healthData && <p style={{ color: 'green' }}>{healthData.healthCheck}</p>}
      </div>

      <div className="form-container" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--social-bg)', borderRadius: '8px' }}>
        <h2>New Procurement Request</h2>
        {createError && <p style={{ color: 'red' }}>Error: {createError.message}</p>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
            <input name="title" value={formData.title} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Department</label>
            <input name="department" value={formData.department} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Needed By Date</label>
              <input type="date" name="neededByDate" value={formData.neededByDate} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
          </div>
          <button type="submit" disabled={createLoading} style={{ padding: '0.75rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}>
            {createLoading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>

      <div className="requests-container">
        <h2>Procurement Requests</h2>
        {loading && <p>Loading requests...</p>}
        {error && <p style={{ color: 'red' }}>Failed to load requests: {error.message}</p>}
        
        {data?.procurementRequests?.length === 0 && <p>No requests found.</p>}
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          {data?.procurementRequests?.map((req: any) => (
            <div key={req.id} className="request-card" style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0 }}>{req.title}</h3>
                <span style={{ padding: '0.25rem 0.5rem', background: 'var(--code-bg)', borderRadius: '4px', fontSize: '0.85rem' }}>{req.status}</span>
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
      </div>

      <hr style={{ margin: '3rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />

      <div className="form-container" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--social-bg)', borderRadius: '8px' }}>
        <h2>Add Line Item to Request</h2>
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

      {/* VENDOR MANAGEMENT SECTION */}
      <h2>Vendor Management</h2>
      <div className="form-container" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--social-bg)', borderRadius: '8px' }}>
        <h3>Add New Vendor</h3>
        {createVendorError && <p style={{ color: 'red' }}>Error: {createVendorError.message}</p>}
        
        <form onSubmit={handleVendorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Vendor Name *</label>
              <input name="name" value={vendorFormData.name} onChange={handleVendorChange} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Contact Name</label>
              <input name="contactName" value={vendorFormData.contactName} onChange={handleVendorChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
              <input type="email" name="email" value={vendorFormData.email} onChange={handleVendorChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone</label>
              <input name="phone" value={vendorFormData.phone} onChange={handleVendorChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Website</label>
              <input type="url" name="website" value={vendorFormData.website} onChange={handleVendorChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Vendor Type</label>
              <select name="vendorType" value={vendorFormData.vendorType} onChange={handleVendorChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}>
                <option value="MANUFACTURER">Manufacturer</option>
                <option value="DISTRIBUTOR">Distributor</option>
                <option value="SERVICE_PROVIDER">Service Provider</option>
                <option value="CALIBRATION_LAB">Calibration Lab</option>
                <option value="CONTRACTOR">Contractor</option>
                <option value="OEM">OEM</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Industries (comma-separated)</label>
              <input name="industries" value={vendorFormData.industries} onChange={handleVendorChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} placeholder="Nuclear, Medical, Industrial..." />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Specialties (comma-separated)</label>
              <input name="specialties" value={vendorFormData.specialties} onChange={handleVendorChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} placeholder="Radiation monitoring, pumps..." />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Qualification Status</label>
              <select name="qualificationStatus" value={vendorFormData.qualificationStatus} onChange={handleVendorChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}>
                <option value="UNREVIEWED">Unreviewed</option>
                <option value="APPROVED">Approved</option>
                <option value="PREFERRED">Preferred</option>
                <option value="RESTRICTED">Restricted</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              <input type="checkbox" name="isPreferred" id="isPreferred" checked={vendorFormData.isPreferred} onChange={handleVendorChange} />
              <label htmlFor="isPreferred">Preferred Vendor</label>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Address</label>
            <input name="address" value={vendorFormData.address} onChange={handleVendorChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Notes</label>
            <textarea name="notes" value={vendorFormData.notes} onChange={handleVendorChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={createVendorLoading} style={{ padding: '0.75rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}>
            {createVendorLoading ? 'Adding...' : 'Add Vendor'}
          </button>
        </form>
      </div>

      <div className="vendors-container">
        <h3>All Vendors</h3>
        {vendorsLoading && <p>Loading vendors...</p>}
        {vendorsError && <p style={{ color: 'red' }}>Failed to load vendors: {vendorsError.message}</p>}
        
        {vendorsData?.vendors?.length === 0 && <p>No vendors found.</p>}
        
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {vendorsData?.vendors?.map((v: any) => (
            <div key={v.id} className="vendor-card" style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: '0' }}>{v.name}</h4>
                {v.isPreferred && <span style={{ padding: '0.2rem 0.4rem', background: 'gold', color: 'black', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>★ PREFERRED</span>}
              </div>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>
                <span style={{ padding: '0.2rem 0.4rem', background: 'var(--code-bg)', borderRadius: '4px' }}>{v.vendorType}</span>
                <span style={{ padding: '0.2rem 0.4rem', marginLeft: '0.5rem', background: v.qualificationStatus === 'APPROVED' ? '#4caf50' : v.qualificationStatus === 'UNREVIEWED' ? 'gray' : 'var(--code-bg)', color: v.qualificationStatus === 'APPROVED' ? 'white' : 'inherit', borderRadius: '4px' }}>{v.qualificationStatus}</span>
              </p>
              {v.industries?.length > 0 && <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}><strong>Industries:</strong> {v.industries.join(', ')}</p>}
              {v.specialties?.length > 0 && <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}><strong>Specialties:</strong> {v.specialties.join(', ')}</p>}
              {v.contactName && <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>Contact: {v.contactName}</p>}
              {v.email && <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>Email: {v.email}</p>}
              {v.phone && <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>Phone: {v.phone}</p>}
              {v.website && <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>Website: <a href={v.website} target="_blank" rel="noreferrer">{v.website}</a></p>}
              {v.address && <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>Address: {v.address}</p>}
              {v.notes && <p style={{ margin: '0.5rem 0', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text)' }}>Notes: {v.notes}</p>}
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text)' }}>
                Added: {new Date(v.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr style={{ margin: '3rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />

      {/* PURCHASE ORDERS SECTION */}
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
                {data?.procurementRequests?.map((req: any) => (
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

      <div className="pos-container">
        <h3>All Purchase Orders</h3>
        {poLoading && <p>Loading purchase orders...</p>}
        {poError && <p style={{ color: 'red' }}>Failed to load purchase orders: {poError.message}</p>}
        
        {poData?.purchaseOrders?.length === 0 && <p>No purchase orders found.</p>}
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          {poData?.purchaseOrders?.map((po: any) => (
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

      <hr style={{ margin: '3rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />

      {/* RECEIVING SECTION */}
      <h2>Receiving</h2>
      <div className="form-container" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--social-bg)', borderRadius: '8px' }}>
        <h3>Log Item Receipt</h3>
        {receiveError && <p style={{ color: 'red' }}>Error: {receiveError.message}</p>}
        
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

          <button type="submit" disabled={receiveLoading || !receiveFormData.purchaseOrderItemId} style={{ padding: '0.75rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}>
            {receiveLoading ? 'Logging...' : 'Log Receipt'}
          </button>
        </form>
      </div>

    </div>
  )
}

export default App
