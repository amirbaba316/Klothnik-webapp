import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { categoryService } from '../services/category.service';
import { Category } from '../types';
import toast from 'react-hot-toast';

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: '',
    status: 'ENABLED' as 'ENABLED' | 'DISABLED',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('parent', formData.parent);
      data.append('status', formData.status);
      if (imageFile) {
        data.append('file', imageFile);
      }

      if (selectedCategory) {
        await categoryService.update(selectedCategory._id, data);
        toast.success('Category updated successfully');
      } else {
        await categoryService.create(data);
        toast.success('Category created successfully');
      }

      setIsModalOpen(false);
      resetForm();
      loadCategories();
    } catch (error) {
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await categoryService.delete(id);
      toast.success('Category deleted successfully');
      loadCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parent:
        typeof category.parent === 'string'
          ? category.parent
          : category.parent?._id || '',
      status: category.status,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', parent: '', status: 'ENABLED' });
    setImageFile(null);
    setSelectedCategory(null);
  };

  const getStatusBadge = (status: string) => {
    return status === 'ENABLED' ? 'badge-success' : 'badge-danger';
  };

  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      ENABLED: 'Enabled',
      DISABLED: 'Disabled',
    };
    return labelMap[status] || status;
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name' as keyof Category,
    },
    {
      header: 'Description',
      accessor: (row: Category) => row.description || '-',
    },
    {
      header: 'Status',
      accessor: (row: Category) => (
        <span className={`badge ${getStatusBadge(row.status)}`}>
          {getStatusLabel(row.status)}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: Category) => (
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
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-display font-bold text-gray-900'>
            Categories
          </h1>
          <p className='text-gray-600 mt-1'>Manage your product categories</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className='btn btn-primary'
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <Table data={categories} columns={columns} loading={loading} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedCategory ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Name
            </label>
            <input
              type='text'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className='input'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className='input'
              rows={3}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Parent Category
            </label>
            <select
              value={formData.parent}
              onChange={(e) =>
                setFormData({ ...formData, parent: e.target.value })
              }
              className='input'
            >
              <option value=''>None</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'ENABLED' | 'DISABLED',
                })
              }
              className='input'
            >
              <option value='ENABLED'>Enabled</option>
              <option value='DISABLED'>Disabled</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Image
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
              {selectedCategory ? 'Update' : 'Create'}
            </button>
            <button
              type='button'
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className='btn btn-secondary flex-1'
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
