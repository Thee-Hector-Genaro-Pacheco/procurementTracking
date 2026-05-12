import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_USERS, CREATE_USER } from '../graphql/queries'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { FormField } from '../components/ui/FormField'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/shared/StatusBadge'
import { LoadingState } from '../components/shared/LoadingState'
import { EmptyState } from '../components/ui/EmptyState'
import { useUser } from '../contexts/UserContext'

export const UsersPage = () => {
  const { currentUser } = useUser()
  const { data: usersData, loading: usersLoading } = useQuery<any>(GET_USERS)
  const [createUser, { loading: createUserLoading, error: createUserError }] = useMutation<any>(CREATE_USER, {
    refetchQueries: [{ query: GET_USERS }]
  })

  const [formData, setFormData] = useState({ name: '', email: '', role: 'REQUESTER', department: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createUser({ variables: { input: formData } })
      setFormData({ name: '', email: '', role: 'REQUESTER', department: '' })
    } catch (err) {}
  }

  return (
    <div className="page">
      <PageHeader title="User Management" subtitle="Manage application access and roles" />

      {currentUser?.role === 'ADMIN' ? (
        <Card className="form-card">
          <h3 className="section-header">Provision New User</h3>
          {createUserError && <div className="error-message">{createUserError.message}</div>}

          <form onSubmit={handleSubmit} className="form-grid">
            <FormField label="Name *">
              <input name="name" value={formData.name} onChange={handleChange} required />
            </FormField>
            
            <FormField label="Email *">
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </FormField>
            
            <FormField label="Role *">
              <select name="role" value={formData.role} onChange={handleChange} required>
                <option value="ADMIN">ADMIN</option>
                <option value="APPROVER">APPROVER</option>
                <option value="BUYER">BUYER</option>
                <option value="RECEIVER">RECEIVER</option>
                <option value="REQUESTER">REQUESTER</option>
              </select>
            </FormField>
            
            <FormField label="Department">
              <input name="department" value={formData.department} onChange={handleChange} />
            </FormField>
            
            <div className="form-grid-full">
              <Button type="submit" disabled={createUserLoading}>
                {createUserLoading ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card>
          <p style={{ margin: 0, color: 'var(--color-muted)', textAlign: 'center' }}>
            Only administrators can provision new users. Please contact an admin if you need access for a new team member.
          </p>
        </Card>
      )}

      <section className="section">
        <h2 className="section-header">Active Users</h2>
        
        {usersLoading ? (
          <LoadingState />
        ) : usersData?.users?.length === 0 ? (
          <EmptyState message="No users found." />
        ) : (
          <div className="card-grid">
            {usersData?.users.map((u: any) => (
              <Card key={u.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-accent-dark)' }}>{u.name}</h3>
                  <StatusBadge status={u.role} />
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span><strong>Email:</strong> {u.email}</span>
                  <span><strong>Department:</strong> {u.department || 'N/A'}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}