import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';
import { Orders } from './pages/Orders';
import { Users } from './pages/Users';

function App() {
  return (
    <BrowserRouter>
      <Toaster position='top-right' />
      <Layout>
        <Routes>
          <Route path='/' element={<Dashboard />} />
          <Route path='/products' element={<Products />} />
          <Route path='/categories' element={<Categories />} />
          <Route path='/orders' element={<Orders />} />
          <Route path='/users' element={<Users />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
