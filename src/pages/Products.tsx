import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { Product, Category } from '../types';
import toast from 'react-hot-toast';

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    costPerItem: '',
    sku: '',
    barcode: '',
    quantity: '',
    weight: '',
    size: '',
    category: '',
    status: 'ACTIVE' as 'ACTIVE' | 'OUT_OF_STOCK',
    tags: '',
  });
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('compareAtPrice', formData.compareAtPrice);
      data.append('costPerItem', formData.costPerItem);
      data.append('sku', formData.sku);
      data.append('barcode', formData.barcode);
      data.append('quantity', formData.quantity);
      data.append('weight', formData.weight);
      data.append('size', formData.size);
      data.append('category', formData.category);
      data.append('status', formData.status);
      data.append(
        'tags',
        JSON.stringify(
          formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        )
      );
      data.append('options', JSON.stringify({}));
      data.append('variants', JSON.stringify([]));
      data.append('reviews', JSON.stringify([]));

      if (imageFiles) {
        Array.from(imageFiles).forEach((file) => {
          data.append('files', file);
        });
      }

      if (selectedProduct) {
        await productService.update(
          formData.category,
          selectedProduct._id,
          data
        );
        toast.success('Product updated successfully');
      } else {
        await productService.create(formData.category, data);
        toast.success('Product created successfully');
      }

      setIsModalOpen(false);
      resetForm();
      loadProducts();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const categoryId =
        typeof product.category === 'string'
          ? product.category
          : product.category._id;
      await productService.delete(categoryId, product._id);
      toast.success('Product deleted successfully');
      loadProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      compareAtPrice: product.compareAtPrice?.toString() || '',
      costPerItem: product.costPerItem?.toString() || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      quantity: product.quantity?.toString() || '',
      weight: product.weight?.toString() || '',
      size: product.size || '',
      category:
        typeof product.category === 'string'
          ? product.category
          : product.category._id,
      status: product.status,
      tags: product.tags.join(', '),
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      compareAtPrice: '',
      costPerItem: '',
      sku: '',
      barcode: '',
      quantity: '',
      weight: '',
      size: '',
      category: '',
      status: 'ACTIVE',
      tags: '',
    });
    setImageFiles(null);
    setSelectedProduct(null);
  };

  const getStatusBadge = (status: string) => {
    return status === 'ACTIVE' ? 'badge-success' : 'badge-danger';
  };

  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      ACTIVE: 'Active',
      OUT_OF_STOCK: 'Out of Stock',
    };
    return labelMap[status] || status;
  };

  const columns = [
    {
      header: 'Product',
      accessor: 'name' as keyof Product,
    },
    {
      header: 'SKU',
      accessor: (row: Product) => row.sku || '-',
    },
    {
      header: 'Price',
      accessor: (row: Product) => `₹${row.price.toFixed(2)}`,
    },
    {
      header: 'Quantity',
      accessor: (row: Product) => row.quantity || 0,
    },
    {
      header: 'Status',
      accessor: (row: Product) => (
        <span className={`badge ${getStatusBadge(row.status)}`}>
          {getStatusLabel(row.status)}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: Product) => (
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
              handleDelete(row);
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
            Products
          </h1>
          <p className='text-gray-600 mt-1'>Manage your product catalog</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className='btn btn-primary'
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <Table data={products} columns={columns} loading={loading} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedProduct ? 'Edit Product' : 'Add Product'}
        size='lg'
      >
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Product Name
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

            <div className='col-span-2'>
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
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className='input'
                required
              >
                <option value=''>Select category</option>
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
                  setFormData({ ...formData, status: e.target.value as any })
                }
                className='input'
              >
                <option value='ACTIVE'>Active</option>
                <option value='OUT_OF_STOCK'>Out of Stock</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Price
              </label>
              <input
                type='number'
                step='0.01'
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className='input'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Compare At Price
              </label>
              <input
                type='number'
                step='0.01'
                value={formData.compareAtPrice}
                onChange={(e) =>
                  setFormData({ ...formData, compareAtPrice: e.target.value })
                }
                className='input'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                SKU
              </label>
              <input
                type='text'
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                className='input'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Barcode
              </label>
              <input
                type='text'
                value={formData.barcode}
                onChange={(e) =>
                  setFormData({ ...formData, barcode: e.target.value })
                }
                className='input'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Quantity
              </label>
              <input
                type='number'
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className='input'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Weight (kg)
              </label>
              <input
                type='number'
                step='0.01'
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                className='input'
              />
            </div>

            <div className='col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Tags (comma separated)
              </label>
              <input
                type='text'
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className='input'
                placeholder='summer, sale, trending'
              />
            </div>

            <div className='col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Images
              </label>
              <input
                type='file'
                accept='image/*'
                multiple
                onChange={(e) => setImageFiles(e.target.files)}
                className='input'
              />
            </div>
          </div>

          <div className='flex gap-3 pt-4'>
            <button type='submit' className='btn btn-primary flex-1'>
              {selectedProduct ? 'Update' : 'Create'}
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
