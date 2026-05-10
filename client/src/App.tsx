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
    </div>
  )
}

export default App
