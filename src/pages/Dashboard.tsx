import { IndianRupee, Package, ShoppingCart, Users } from 'lucide-react';

export function Dashboard() {
  const stats = [
    {
      name: 'Total Revenue',
      value: '\u20B945,231',
      icon: IndianRupee,
      change: '+20.1%',
      changeType: 'positive',
    },
    {
      name: 'Orders',
      value: '356',
      icon: ShoppingCart,
      change: '+12.5%',
      changeType: 'positive',
    },
    {
      name: 'Products',
      value: '2,345',
      icon: Package,
      change: '+4.3%',
      changeType: 'positive',
    },
    {
      name: 'Customers',
      value: '1,234',
      icon: Users,
      change: '+8.2%',
      changeType: 'positive',
    },
  ];

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-display font-bold text-gray-900'>
          Dashboard
        </h1>
        <p className='text-gray-600 mt-1'>
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className='card p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>{stat.name}</p>
                  <p className='text-2xl font-bold text-gray-900 mt-2'>
                    {stat.value}
                  </p>
                  <p
                    className={`text-sm mt-2 ${
                      stat.changeType === 'positive'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {stat.change} from last month
                  </p>
                </div>
                <div className='h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center'>
                  <Icon className='text-primary-600' size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='card p-6'>
          <h2 className='text-lg font-display font-bold text-gray-900 mb-4'>
            Recent Orders
          </h2>
          <div className='space-y-4'>
            {[1, 2, 3, 4].map((_, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between py-3 border-b last:border-0'
              >
                <div>
                  <p className='font-medium text-gray-900'>
                    Order #100{idx + 1}
                  </p>
                  <p className='text-sm text-gray-600'>2 items • 989.99</p>
                </div>
                <span className='badge badge-success'>Completed</span>
              </div>
            ))}
          </div>
        </div>

        <div className='card p-6'>
          <h2 className='text-lg font-display font-bold text-gray-900 mb-4'>
            Top Products
          </h2>
          <div className='space-y-4'>
            {[1, 2, 3, 4].map((_, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between py-3 border-b last:border-0'
              >
                <div>
                  <p className='font-medium text-gray-900'>
                    Product Name {idx + 1}
                  </p>
                  <p className='text-sm text-gray-600'>45 sold this month</p>
                </div>
                <span className='text-primary-600 font-semibold'>91,245</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
