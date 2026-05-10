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
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleVendorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setVendorFormData({ ...vendorFormData, [e.target.name]: e.target.value })
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
      await createVendor({ variables: { input: vendorFormData } })
      setVendorFormData({
        name: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
      })
    } catch (err) {
      console.error("Failed to create vendor", err)
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
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text)' }}>
                <span>Priority: {req.priority}</span>
                <span>Needed: {req.neededByDate ? new Date(req.neededByDate).toLocaleDateString() : 'Not specified'}</span>
                <span>Created: {new Date(req.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr style={{ margin: '3rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />

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
              <h4 style={{ margin: '0 0 0.5rem 0' }}>{v.name}</h4>
              {v.contactName && <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>Contact: {v.contactName}</p>}
              {v.email && <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>Email: {v.email}</p>}
              {v.phone && <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>Phone: {v.phone}</p>}
              {v.address && <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>Address: {v.address}</p>}
              {v.notes && <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text)' }}>Notes: {v.notes}</p>}
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
