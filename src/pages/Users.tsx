import React, { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { userService } from '../services/user.service';
import { User } from '../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    role: 'CUSTOMER' as 'ADMIN' | 'CUSTOMER',
    status: 'ENABLED' as 'ENABLED' | 'DISABLED' | 'DELETED',
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const data = new FormData();
      data.append('role', formData.role);
      data.append('status', formData.status);
      data.append('isActive', formData.isActive.toString());
      if (imageFile) {
        data.append('file', imageFile);
      }

      await userService.update(selectedUser._id, data);
      toast.success('User updated successfully');
      setIsModalOpen(false);
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await userService.delete(id);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      role: user.role,
      status: user.status,
      isActive: user.isActive,
    });
    setIsModalOpen(true);
  };

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: 'badge-danger',
      customer: 'badge-success',
    };
    return roleMap[role] || 'badge-info';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      ENABLED: 'badge-success',
      DISABLED: 'badge-warning',
      DELETED: 'badge-danger',
    };
    return statusMap[status] || 'badge-info';
  };

  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      ENABLED: 'Enabled',
      DISABLED: 'Disabled',
      DELETED: 'Deleted',
    };
    return labelMap[status] || status;
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name' as keyof User,
    },
    {
      header: 'Email',
      accessor: 'email' as keyof User,
    },
    {
      header: 'Phone',
      accessor: (row: User) => row.phone || '-',
    },
    {
      header: 'Role',
      accessor: (row: User) => (
        <span className={`badge ${getRoleBadge(row.role)}`}>{row.role}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: User) => (
        <span className={`badge ${getStatusBadge(row.status)}`}>
          {getStatusLabel(row.status)}
        </span>
      ),
    },
    {
      header: 'Active',
      accessor: (row: User) => (
        <span
          className={`badge ${row.isActive ? 'badge-success' : 'badge-danger'}`}
        >
          {row.isActive ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      header: 'Joined',
      accessor: (row: User) => format(new Date(row.createdAt), 'MMM dd, yyyy'),
    },
    {
      header: 'Actions',
      accessor: (row: User) => (
        <div className='flex items-center gap-2'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className='text-primary-600 hover:text-primary-700'
          >
            <Edit size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row._id);
            }}
            className='text-red-600 hover:text-red-700'
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-display font-bold text-gray-900'>Users</h1>
        <p className='text-gray-600 mt-1'>
          Manage user accounts and permissions
        </p>
      </div>

      <Table data={users} columns={columns} loading={loading} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title='Edit User'
      >
        {selectedUser && (
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p className='text-sm text-gray-600'>First Name</p>
              <p className='font-semibold'>{selectedUser.firstName}</p>
              <p className='text-sm text-gray-600 mt-2'>Last Name</p>
              <p className='font-semibold'>{selectedUser.lastName}</p>
              <p className='text-sm text-gray-600 mt-2'>Phone</p>
              <p className='font-semibold'>{selectedUser.phone || 'N/A'}</p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as any })
                }
                className='input'
              >
                <option value='customer'>Customer</option>
                <option value='admin'>Admin</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
                className='input'
              >
                <option value='ENABLED'>Enabled</option>
                <option value='DISABLED'>Disabled</option>
                <option value='DELETED'>Deleted</option>
              </select>
            </div>

            <div>
              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className='rounded border-gray-300 text-primary-600 focus:ring-primary-500'
                />
                <span className='text-sm font-medium text-gray-700'>
                  Account Active
                </span>
              </label>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Profile Image
              </label>
              <input
                type='file'
                accept='image/*'
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className='input'
              />
            </div>

            <div className='flex gap-3 pt-4'>
              <button type='submit' className='btn btn-primary flex-1'>
                Update User
              </button>
              <button
                type='button'
                onClick={() => setIsModalOpen(false)}
                className='btn btn-secondary flex-1'
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
