import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_USERS, CREATE_USER } from '../graphql/queries';

export const UsersPage: React.FC = () => {
  const { data: usersData, loading: usersLoading, error: usersError } = useQuery<any>(GET_USERS);
  const [createUser, { loading: createLoading, error: createError }] = useMutation<any>(CREATE_USER, {
    refetchQueries: [{ query: GET_USERS }],
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'REQUESTER',
    department: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({ variables: { input: formData } });
      setFormData({ name: '', email: '', role: 'REQUESTER', department: '' });
    } catch (err) {
      console.error('Error creating user:', err);
    }
  };

  if (usersLoading) return <p>Loading users...</p>;

  return (
    <div>
      <h2>Users & Roles</h2>

      <div className="form-container" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--social-bg)', borderRadius: '8px' }}>
        <h3>Add New User</h3>
        {createError && <p style={{ color: 'red' }}>Error: {createError.message}</p>}
        {usersError && <p style={{ color: 'red' }}>Error loading users: {usersError.message}</p>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Role *</label>
              <select name="role" value={formData.role} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}>
                <option value="ADMIN">Admin</option>
                <option value="APPROVER">Approver</option>
                <option value="BUYER">Buyer</option>
                <option value="RECEIVER">Receiver</option>
                <option value="REQUESTER">Requester</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Department</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
          </div>
          <button type="submit" disabled={createLoading} style={{ alignSelf: 'flex-start', padding: '0.5rem 1.5rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {createLoading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {usersData?.users?.map((user: any) => (
          <div key={user.id} style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--accent)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>{user.name}</h4>
            <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.email}</p>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}><strong>Role:</strong> {user.role}</p>
            <p style={{ margin: '0', fontSize: '0.9rem' }}><strong>Department:</strong> {user.department || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
