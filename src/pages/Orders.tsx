import React, { useState, useEffect, useMemo } from 'react';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { orderService } from '../services/order.service';
import { Order } from '../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    trackingNumber: '',
    notes: '',
  });

  useEffect(() => {
    loadOrders();
  }, []);

  // Sort orders by creation date (newest first)
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [orders]);

  const newOrdersCount = useMemo(() => {
    return orders.filter((order) => !order.isViewed).length;
  }, [orders]);

  const loadOrders = async () => {
    try {
      console.log('Starting to load orders...');
      setLoading(true);
      const data = await orderService.getAll();
      console.log('Orders loaded:', data);
      setOrders(data);
    } catch (error) {
      console.error('Order loading error:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (order: Order) => {
    try {
      setIsModalOpen(true);
      setModalLoading(true);

      // Mark order as viewed if not already viewed
      if (!order.isViewed) {
        await orderService.updateView(order._id, true);

        // Update local state immediately to reflect the change
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o._id === order._id ? { ...o, isViewed: true } : o
          )
        );
      }

      // Fetch full order details including populated user
      const fullOrder = await orderService.getById(order._id);
      setSelectedOrder(fullOrder);
      setFormData({
        status: fullOrder.status,
        trackingNumber: fullOrder.trackingNumber || '',
        notes: fullOrder.notes || '',
      });
    } catch (error) {
      toast.error('Failed to load order details');
      setIsModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      await orderService.update(selectedOrder._id, {
        status: formData.status || undefined,
        trackingNumber: formData.trackingNumber || undefined,
        notes: formData.notes || undefined,
      });
      toast.success('Order updated successfully');
      setIsModalOpen(false);
      loadOrders();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      PLACED: 'badge-info',
      CONFIRMED: 'badge-info',
      PROCESSING: 'badge-warning',
      SHIPPED: 'badge-info',
      OUT_FOR_DELIVERY: 'badge-info',
      DELIVERED: 'badge-success',
      CANCELLED: 'badge-danger',
      PAID: 'badge-success',
      pending: 'badge-warning',
      processing: 'badge-info',
      shipped: 'badge-info',
      delivered: 'badge-success',
      cancelled: 'badge-danger',
    };
    return statusMap[status] || 'badge-info';
  };

  const getStatusLabel = (status: string) => {
    return status
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const columns = [
    {
      header: 'Order ID',
      accessor: (row: Order) => (
        <div className='flex items-center gap-2'>
          <span>{row._id.slice(-6).toUpperCase()}</span>
          {!row.isViewed ? (
            <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse'>
              NEW
            </span>
          ) : (
            <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600'>
              SEEN
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Total',
      accessor: (row: Order) => `₹${row.total.toFixed(2)}`,
    },
    {
      header: 'Status',
      accessor: (row: Order) => (
        <span className={`badge ${getStatusBadge(row.status)}`}>
          {getStatusLabel(row.status)}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: (row: Order) => format(new Date(row.createdAt), 'MMM dd, yyyy'),
    },
  ];

  return (
    <div className='space-y-6'>
      <div>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-display font-bold text-gray-900'>
              Orders
            </h1>
            <p className='text-gray-600 mt-1'>
              Manage customer orders and shipments
            </p>
          </div>
          {newOrdersCount > 0 && (
            <div className='flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg'>
              <span className='w-2 h-2 bg-red-500 rounded-full animate-pulse'></span>
              <span className='text-sm font-medium text-red-800'>
                {newOrdersCount} new order{newOrdersCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      <Table
        data={sortedOrders}
        columns={columns}
        loading={loading}
        onRowClick={handleRowClick}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title='Order Details'
        size='lg'
      >
        {modalLoading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600'></div>
          </div>
        ) : (
          selectedOrder && (
            <div className='space-y-6'>
              {/* Order Info */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-gray-600'>Order ID</p>
                  <p className='font-semibold'>{selectedOrder._id}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Date</p>
                  <p className='font-semibold'>
                    {format(
                      new Date(selectedOrder.createdAt),
                      'MMM dd, yyyy HH:mm'
                    )}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Status</p>
                  <span
                    className={`badge ${getStatusBadge(selectedOrder.status)}`}
                  >
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Total</p>
                  <p className='font-semibold text-primary-600'>
                    ₹{selectedOrder.total.toFixed(2)}
                  </p>
                </div>
                {selectedOrder.razorpayOrderId && (
                  <div>
                    <p className='text-sm text-gray-600'>Razorpay Order ID</p>
                    <p className='font-medium text-sm'>
                      {selectedOrder.razorpayOrderId}
                    </p>
                  </div>
                )}
              </div>

              {/* Customer Details */}
              {typeof selectedOrder.user === 'object' && selectedOrder.user && (
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <h3 className='font-semibold text-gray-900 mb-3'>
                    Customer Information
                  </h3>
                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      <p className='text-sm text-gray-600'>Name</p>
                      <p className='font-medium'>
                        {selectedOrder.user.firstName}{' '}
                        {selectedOrder.user.lastName}
                      </p>
                    </div>
                    {selectedOrder.user.phone && (
                      <div>
                        <p className='text-sm text-gray-600'>Phone</p>
                        <p className='font-medium'>
                          {selectedOrder.user.phone}
                        </p>
                      </div>
                    )}
                    {selectedOrder.user.gender && (
                      <div>
                        <p className='text-sm text-gray-600'>Gender</p>
                        <p className='font-medium'>
                          {selectedOrder.user.gender}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className='text-sm text-gray-600'>Customer ID</p>
                      <p className='font-medium text-sm'>
                        {selectedOrder.user._id}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className='font-semibold text-gray-900 mb-3'>
                  Order Items
                </h3>
                <div className='space-y-2'>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className='border rounded-lg p-4'>
                      <div className='flex justify-between mb-2'>
                        <div className='flex-1'>
                          <p className='font-medium text-lg'>
                            {typeof item.product === 'object' && item.product
                              ? item.product.name
                              : 'Product'}
                          </p>
                          {typeof item.product === 'object' &&
                            item.product?.description && (
                              <p className='text-sm text-gray-600 mt-1'>
                                {item.product.description}
                              </p>
                            )}
                        </div>
                        <p className='font-semibold text-lg'>
                          ₹{item.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Product Details */}
                      {typeof item.product === 'object' && item.product && (
                        <div className='grid grid-cols-2 gap-2 text-sm mt-3 pt-3 border-t'>
                          {item.product.sku && (
                            <div>
                              <span className='text-gray-600'>SKU:</span>
                              <span className='ml-2 font-medium'>
                                {item.product.sku}
                              </span>
                            </div>
                          )}
                          {item.product.size && (
                            <div>
                              <span className='text-gray-600'>Size:</span>
                              <span className='ml-2 font-medium'>
                                {item.product.size}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Variant Details */}
                      {typeof item.variant === 'object' && item.variant && (
                        <div className='bg-gray-50 p-3 rounded mt-3'>
                          <p className='text-sm font-medium text-gray-700 mb-2'>
                            Variant Details:
                          </p>
                          <div className='grid grid-cols-2 gap-2 text-sm'>
                            {item.variant.color && (
                              <div>
                                <span className='text-gray-600'>Color:</span>
                                <span className='ml-2 font-medium'>
                                  {item.variant.color}
                                </span>
                              </div>
                            )}
                            {item.variant.size && (
                              <div>
                                <span className='text-gray-600'>Size:</span>
                                <span className='ml-2 font-medium'>
                                  {item.variant.size}
                                </span>
                              </div>
                            )}
                            {item.variant.sku && (
                              <div>
                                <span className='text-gray-600'>
                                  Variant SKU:
                                </span>
                                <span className='ml-2 font-medium'>
                                  {item.variant.sku}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className='flex justify-between mt-3 pt-3 border-t'>
                        <p className='text-sm text-gray-600'>
                          Quantity: {item.quantity}
                        </p>
                        <p className='font-semibold'>
                          Total: ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Order Summary */}
                  <div className='pt-3 space-y-2 border-t-2 mt-4'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600'>Subtotal</span>
                      <span className='font-medium'>
                        ₹{selectedOrder.subTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600'>Tax</span>
                      <span className='font-medium'>
                        ₹{selectedOrder.tax.toFixed(2)}
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600'>Shipping Fee</span>
                      <span className='font-medium'>
                        ₹{selectedOrder.shippingFee.toFixed(2)}
                      </span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className='flex justify-between text-sm text-green-600'>
                        <span>Discount</span>
                        <span className='font-medium'>
                          -₹{selectedOrder.discount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className='flex justify-between text-base font-semibold pt-2 border-t'>
                      <span>Total</span>
                      <span className='text-primary-600'>
                        ₹{selectedOrder.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>
                    Shipping Address
                  </h3>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <p className='font-medium mb-1'>
                      {selectedOrder.shippingAddress.type}
                    </p>
                    <p className='text-gray-700'>
                      {selectedOrder.shippingAddress.houseNo},{' '}
                      {selectedOrder.shippingAddress.locality}
                      <br />
                      {selectedOrder.shippingAddress.city},{' '}
                      {selectedOrder.shippingAddress.state} -{' '}
                      {selectedOrder.shippingAddress.pincode}
                      <br />
                      {selectedOrder.shippingAddress.country}
                      <br />
                      Phone: {selectedOrder.shippingAddress.phone}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div>
                <h3 className='font-semibold text-gray-900 mb-3'>
                  Payment Method
                </h3>
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <p className='font-medium'>{selectedOrder.paymentMethod}</p>
                </div>
              </div>

              {/* Order Timeline */}
              {selectedOrder.orderTimeline && (
                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>
                    Order Timeline
                  </h3>
                  <div className='space-y-3'>
                    {Object.entries(selectedOrder.orderTimeline).map(
                      ([key, timeline]: [string, any]) => (
                        <div
                          key={key}
                          className={`flex items-start gap-3 p-3 rounded-lg ${
                            timeline.flag
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-gray-50'
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full mt-1 ${
                              timeline.flag ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          />
                          <div className='flex-1'>
                            <p className='font-medium'>{timeline.message}</p>
                            {timeline.date && (
                              <p className='text-sm text-gray-600'>
                                {format(
                                  new Date(timeline.date),
                                  'MMM dd, yyyy HH:mm'
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className='font-semibold text-gray-900 mb-3'>Notes</h3>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <p className='text-gray-700'>{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Update Form */}
              <form onSubmit={handleSubmit} className='space-y-4 pt-4 border-t'>
                <h3 className='font-semibold text-gray-900'>Update Order</h3>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className='input'
                  >
                    <option value='PLACED'>Placed</option>
                    <option value='CONFIRMED'>Confirmed</option>
                    <option value='PROCESSING'>Processing</option>
                    <option value='SHIPPED'>Shipped</option>
                    <option value='OUT_FOR_DELIVERY'>Out for Delivery</option>
                    <option value='DELIVERED'>Delivered</option>
                    <option value='CANCELLED'>Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Tracking Number
                  </label>
                  <input
                    type='text'
                    value={formData.trackingNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        trackingNumber: e.target.value,
                      })
                    }
                    className='input'
                    placeholder='Enter tracking number'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className='input'
                    rows={3}
                    placeholder='Add notes about this order'
                  />
                </div>

                <div className='flex gap-3'>
                  <button type='submit' className='btn btn-primary flex-1'>
                    Update Order
                  </button>
                  <button
                    type='button'
                    onClick={handleModalClose}
                    className='btn btn-secondary flex-1'
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          )
        )}
      </Modal>
    </div>
  );
}
