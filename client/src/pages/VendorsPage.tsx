import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_VENDORS, CREATE_VENDOR } from '../graphql/queries'

export const VendorsPage: React.FC = () => {
  const { data: vendorsData, loading: vendorLoading, error: vendorError } = useQuery<any>(GET_VENDORS)
  const [createVendor, { loading: createVendorLoading, error: createVendorError }] = useMutation<any>(CREATE_VENDOR, {
    refetchQueries: [{ query: GET_VENDORS }],
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

  const [vendorFilter, setVendorFilter] = useState('ALL')

  const handleVendorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setVendorFormData({ ...vendorFormData, [e.target.name]: value })
  }

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const input = {
        ...vendorFormData,
        industries: vendorFormData.industries ? vendorFormData.industries.split(',').map(s => s.trim()) : [],
        specialties: vendorFormData.specialties ? vendorFormData.specialties.split(',').map(s => s.trim()) : [],
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

  const filteredVendors = vendorsData?.vendors?.filter((v: any) => vendorFilter === 'ALL' || v.qualificationStatus === vendorFilter) || []

  return (
    <div>
      <h2>Vendor Management</h2>
      <div className="form-container" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--social-bg)', borderRadius: '8px' }}>
        <h3>Add New Vendor</h3>
        {createVendorError && <p style={{ color: 'red' }}>Error: {createVendorError.message}</p>}
        
        <form onSubmit={handleVendorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Vendor Name *</label>
              <input name="name" value={vendorFormData.name} onChange={handleVendorChange} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Vendor Type</label>
              <select name="vendorType" value={vendorFormData.vendorType} onChange={handleVendorChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}>
                <option value="MANUFACTURER">Manufacturer</option>
                <option value="DISTRIBUTOR">Distributor</option>
                <option value="SERVICE_PROVIDER">Service Provider</option>
                <option value="CONTRACTOR">Contractor</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Contact Name</label>
              <input name="contactName" value={vendorFormData.contactName} onChange={handleVendorChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
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
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Qualification Status</label>
              <select name="qualificationStatus" value={vendorFormData.qualificationStatus} onChange={handleVendorChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}>
                <option value="UNREVIEWED">Unreviewed</option>
                <option value="APPROVED">Approved</option>
                <option value="PREFERRED">Preferred</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" name="isPreferred" checked={vendorFormData.isPreferred} onChange={handleVendorChange} />
              Mark as Preferred Vendor
            </label>
          </div>

          <button type="submit" disabled={createVendorLoading} style={{ padding: '0.75rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}>
            {createVendorLoading ? 'Adding...' : 'Add Vendor'}
          </button>
        </form>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Vendor Directory</h3>
        <div>
          <label style={{ marginRight: '0.5rem' }}>Filter by Status:</label>
          <select value={vendorFilter} onChange={e => setVendorFilter(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <option value="ALL">All</option>
            <option value="UNREVIEWED">UNREVIEWED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="PREFERRED">PREFERRED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {vendorLoading && <p>Loading vendors...</p>}
      {vendorError && <p style={{ color: 'red' }}>Failed to load vendors: {vendorError.message}</p>}
      {filteredVendors.length === 0 && !vendorLoading && <p>No vendors found.</p>}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {filteredVendors.map((v: any) => (
          <div key={v.id} className="vendor-card" style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'left', background: 'var(--card-bg)', position: 'relative' }}>
            {v.isPreferred && (
              <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'gold', color: 'black', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                ★ PREFERRED
              </span>
            )}
            <h3 style={{ margin: '0 0 0.5rem 0', paddingRight: '60px' }}>{v.name}</h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ padding: '0.2rem 0.4rem', background: 'var(--code-bg)', borderRadius: '4px', fontSize: '0.75rem' }}>{v.vendorType}</span>
              <span style={{ padding: '0.2rem 0.4rem', background: v.qualificationStatus === 'APPROVED' || v.qualificationStatus === 'PREFERRED' ? '#d4edda' : 'var(--code-bg)', color: v.qualificationStatus === 'APPROVED' || v.qualificationStatus === 'PREFERRED' ? '#155724' : 'var(--text)', borderRadius: '4px', fontSize: '0.75rem' }}>{v.qualificationStatus}</span>
            </div>
            
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>👤 {v.contactName || 'No contact specified'}</p>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>📧 {v.email ? <a href={`mailto:${v.email}`} style={{ color: 'var(--accent)' }}>{v.email}</a> : 'N/A'}</p>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>📞 {v.phone || 'N/A'}</p>
            {v.website && <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>🌐 <a href={v.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Website</a></p>}
          </div>
        ))}
      </div>
    </div>
  )
}
