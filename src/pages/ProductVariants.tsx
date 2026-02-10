import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { productVariantService } from '../services/product-variant.service';
import { Product, ProductVariant } from '../types';
import toast from 'react-hot-toast';

interface ProductVariantsProps {
  product: Product;
  onClose: () => void;
}

export function ProductVariants({ product, onClose }: ProductVariantsProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [formData, setFormData] = useState({
    sku: '',
    price: '',
    compareAtPrice: '',
    costPerItem: '',
    barcode: '',
    quantity: '',
    weight: '',
    size: '',
    color: '',
    image: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',
  });

  useEffect(() => {
    loadVariants();
  }, [product._id]);

  const loadVariants = async () => {
    try {
      setLoading(true);
      const data = await productVariantService.getAll(product._id);
      setVariants(data);
    } catch (error) {
      toast.error('Failed to load variants');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        sku: formData.sku,
        price: Number(formData.price),
        compareAtPrice: formData.compareAtPrice
          ? Number(formData.compareAtPrice)
          : undefined,
        costPerItem: formData.costPerItem
          ? Number(formData.costPerItem)
          : undefined,
        barcode: formData.barcode || undefined,
        quantity: Number(formData.quantity),
        weight: formData.weight ? Number(formData.weight) : undefined,
        size: formData.size,
        color: formData.color,
        image: formData.image || undefined,
        status: formData.status,
      };

      if (selectedVariant) {
        await productVariantService.update(
          product._id,
          selectedVariant._id,
          payload
        );
        toast.success('Variant updated successfully');
      } else {
        await productVariantService.create(product._id, payload);
        toast.success('Variant created successfully');
      }

      setIsFormModalOpen(false);
      resetForm();
      loadVariants();
    } catch (error) {
      toast.error('Failed to save variant');
    }
  };

  const handleDelete = async (variant: ProductVariant) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      await productVariantService.delete(product._id, variant._id);
      toast.success('Variant deleted successfully');
      loadVariants();
    } catch (error) {
      toast.error('Failed to delete variant');
    }
  };

  const handleEdit = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setFormData({
      sku: variant.sku,
      price: variant.price.toString(),
      compareAtPrice: variant.compareAtPrice?.toString() || '',
      costPerItem: variant.costPerItem?.toString() || '',
      barcode: variant.barcode || '',
      quantity: variant.quantity.toString(),
      weight: variant.weight?.toString() || '',
      size: variant.size,
      color: variant.color,
      image: variant.image || '',
      status: variant.status,
    });
    setIsFormModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      price: '',
      compareAtPrice: '',
      costPerItem: '',
      barcode: '',
      quantity: '',
      weight: '',
      size: '',
      color: '',
      image: '',
      status: 'ACTIVE',
    });
    setSelectedVariant(null);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') return 'badge-success';
    if (status === 'INACTIVE') return 'badge-warning';
    if (status === 'ARCHIVED') return 'badge-danger';
    return 'badge-secondary';
  };

  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      ACTIVE: 'Active',
      INACTIVE: 'Inactive',
      ARCHIVED: 'Archived',
    };
    return labelMap[status] || status;
  };

  const columns = [
    {
      header: 'SKU',
      accessor: 'sku' as keyof ProductVariant,
    },
    {
      header: 'Size',
      accessor: 'size' as keyof ProductVariant,
    },
    {
      header: 'Color',
      accessor: 'color' as keyof ProductVariant,
    },
    {
      header: 'Price',
      accessor: (row: ProductVariant) => `₹${row.price.toFixed(2)}`,
    },
    {
      header: 'Quantity',
      accessor: 'quantity' as keyof ProductVariant,
    },
    {
      header: 'Status',
      accessor: (row: ProductVariant) => (
        <span className={`badge ${getStatusBadge(row.status)}`}>
          {getStatusLabel(row.status)}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: ProductVariant) => (
        <div className='flex items-center gap-2'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className='text-primary-600 hover:text-primary-700'
            title='Edit Variant'
          >
            <Edit size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
            className='text-red-600 hover:text-red-700'
            title='Delete Variant'
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Variants List Modal */}
      <Modal
        isOpen={true}
        onClose={onClose}
        title={`Manage Variants - ${product.name}`}
        size='xl'
      >
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <p className='text-sm text-gray-600'>
              Total Variants:{' '}
              <span className='font-semibold'>{variants.length}</span>
            </p>
            <button
              onClick={() => {
                resetForm();
                setIsFormModalOpen(true);
              }}
              className='btn btn-primary btn-sm'
            >
              <Plus size={16} />
              Add Variant
            </button>
          </div>

          <Table data={variants} columns={columns} loading={loading} />
        </div>
      </Modal>

      {/* Variant Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          resetForm();
        }}
        title={selectedVariant ? 'Edit Variant' : 'Add Variant'}
        size='lg'
      >
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                SKU *
              </label>
              <input
                type='text'
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                className='input'
                required
              />
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
                    status: e.target.value as any,
                  })
                }
                className='input'
              >
                <option value='ACTIVE'>Active</option>
                <option value='INACTIVE'>Inactive</option>
                <option value='ARCHIVED'>Archived</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Size *
              </label>
              <input
                type='text'
                value={formData.size}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value })
                }
                className='input'
                required
                placeholder='S, M, L, XL'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Color *
              </label>
              <input
                type='text'
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className='input'
                required
                placeholder='Red, Blue, etc.'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Price *
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
                  setFormData({
                    ...formData,
                    compareAtPrice: e.target.value,
                  })
                }
                className='input'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Cost Per Item
              </label>
              <input
                type='number'
                step='0.01'
                value={formData.costPerItem}
                onChange={(e) =>
                  setFormData({ ...formData, costPerItem: e.target.value })
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
                Quantity *
              </label>
              <input
                type='number'
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className='input'
                required
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
                Image URL (S3 key)
              </label>
              <input
                type='text'
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                className='input'
                placeholder='products/variant-image.jpg'
              />
              <p className='text-xs text-gray-500 mt-1'>
                Enter the S3 key path for the variant image
              </p>
            </div>
          </div>

          <div className='flex gap-3 pt-4'>
            <button type='submit' className='btn btn-primary flex-1'>
              {selectedVariant ? 'Update' : 'Create'}
            </button>
            <button
              type='button'
              onClick={() => {
                setIsFormModalOpen(false);
                resetForm();
              }}
              className='btn btn-secondary flex-1'
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
