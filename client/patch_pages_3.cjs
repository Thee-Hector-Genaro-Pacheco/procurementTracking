const fs = require('fs');
const path = require('path');

const write = (file, content) => {
  fs.writeFileSync(path.join('src/pages', file), content.trim());
};

write('VendorsPage.tsx', `
import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_VENDORS, CREATE_VENDOR } from '../graphql/queries'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { FormField } from '../components/ui/FormField'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/shared/StatusBadge'
import { LoadingState } from '../components/shared/LoadingState'
import { EmptyState } from '../components/ui/EmptyState'
import { useUser } from '../contexts/UserContext'

export const VendorsPage = () => {
  const { currentUser } = useUser()
  const { data: vendorsData, loading: vendorLoading } = useQuery<any>(GET_VENDORS)
  const [createVendor, { loading: createVendorLoading, error: createVendorError }] = useMutation<any>(CREATE_VENDOR, {
    refetchQueries: [{ query: GET_VENDORS }],
  })

  const [vendorFormData, setVendorFormData] = useState({
    name: '', contactName: '', email: '', phone: '', address: '', notes: '', website: '',
    vendorType: 'OTHER', industries: '', specialties: '', isPreferred: false, qualificationStatus: 'UNREVIEWED',
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
        name: '', contactName: '', email: '', phone: '', address: '', notes: '', website: '',
        vendorType: 'OTHER', industries: '', specialties: '', isPreferred: false, qualificationStatus: 'UNREVIEWED',
      })
    } catch (err) {}
  }

  const filteredVendors = vendorsData?.vendors?.filter((v: any) => vendorFilter === 'ALL' || v.qualificationStatus === vendorFilter) || []

  return (
    <div className="page">
      <PageHeader title="Vendor Management" subtitle="Manage suppliers and view their qualification status" />

      {currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'BUYER') && (
        <Card className="form-card">
          <h3 className="section-header">Add New Vendor</h3>
          {createVendorError && <div className="error-message">Error: {createVendorError.message}</div>}
          
          <form onSubmit={handleVendorSubmit} className="form-grid">
            <FormField label="Vendor Name *">
              <input name="name" value={vendorFormData.name} onChange={handleVendorChange} required />
            </FormField>
            
            <FormField label="Vendor Type">
              <select name="vendorType" value={vendorFormData.vendorType} onChange={handleVendorChange}>
                <option value="MANUFACTURER">Manufacturer</option>
                <option value="DISTRIBUTOR">Distributor</option>
                <option value="SERVICE_PROVIDER">Service Provider</option>
                <option value="CONTRACTOR">Contractor</option>
                <option value="OTHER">Other</option>
              </select>
            </FormField>

            <FormField label="Contact Name">
              <input name="contactName" value={vendorFormData.contactName} onChange={handleVendorChange} />
            </FormField>
            <FormField label="Email">
              <input type="email" name="email" value={vendorFormData.email} onChange={handleVendorChange} />
            </FormField>
            <FormField label="Phone">
              <input name="phone" value={vendorFormData.phone} onChange={handleVendorChange} />
            </FormField>
            <FormField label="Website">
              <input name="website" value={vendorFormData.website} onChange={handleVendorChange} />
            </FormField>

            <FormField label="Industries (comma separated)" className="form-grid-full">
              <input name="industries" value={vendorFormData.industries} onChange={handleVendorChange} />
            </FormField>

            <FormField label="Specialties (comma separated)" className="form-grid-full">
              <input name="specialties" value={vendorFormData.specialties} onChange={handleVendorChange} />
            </FormField>
            
            <FormField label="Address" className="form-grid-full">
              <input name="address" value={vendorFormData.address} onChange={handleVendorChange} />
            </FormField>

            <FormField label="Notes" className="form-grid-full">
              <textarea name="notes" value={vendorFormData.notes} onChange={handleVendorChange} />
            </FormField>

            <FormField label="Qualification Status">
              <select name="qualificationStatus" value={vendorFormData.qualificationStatus} onChange={handleVendorChange}>
                <option value="UNREVIEWED">Unreviewed</option>
                <option value="APPROVED">Approved</option>
                <option value="PREFERRED">Preferred</option>
                <option value="RESTRICTED">Restricted</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </FormField>

            <div className="field" style={{ flexDirection: 'row', alignItems: 'center' }}>
              <input type="checkbox" name="isPreferred" checked={vendorFormData.isPreferred} onChange={handleVendorChange} style={{ width: 'auto' }} />
              <label>Is Preferred Vendor</label>
            </div>

            <div className="form-grid-full">
              <Button type="submit" disabled={createVendorLoading}>
                {createVendorLoading ? 'Creating...' : 'Create Vendor'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <section className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Vendor Directory</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filter:</span>
            <select value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)} style={{ padding: '0.4rem', borderRadius: 'var(--radius-button)', border: '1px solid var(--color-border)' }}>
              <option value="ALL">All Vendors</option>
              <option value="UNREVIEWED">Unreviewed</option>
              <option value="APPROVED">Approved</option>
              <option value="PREFERRED">Preferred</option>
              <option value="RESTRICTED">Restricted</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {vendorLoading ? (
          <LoadingState />
        ) : filteredVendors.length === 0 ? (
          <EmptyState message="No vendors found matching the current filter." />
        ) : (
          <div className="card-grid">
            {filteredVendors.map((v: any) => (
              <Card key={v.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: 'var(--color-accent-dark)' }}>{v.name}</h3>
                  <StatusBadge status={v.qualificationStatus} />
                </div>
                
                <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
                  <strong>Type:</strong> {v.vendorType}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  {v.industries?.map((ind: string, idx: number) => <span key={idx} className="chip">{ind}</span>)}
                  {v.specialties?.map((spec: string, idx: number) => <span key={idx} className="chip">{spec}</span>)}
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {v.contactName && <div><strong>Contact:</strong> {v.contactName}</div>}
                  {v.email && <div><strong>Email:</strong> {v.email}</div>}
                  {v.phone && <div><strong>Phone:</strong> {v.phone}</div>}
                  {v.website && <div><strong>Website:</strong> <a href={v.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)' }}>Link</a></div>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
`);

console.log("VendorsPage updated.");
