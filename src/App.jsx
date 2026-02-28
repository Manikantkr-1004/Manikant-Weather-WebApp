import './App.css'
import { Toaster } from 'react-hot-toast';
import AllRoutes from './routes/AllRoutes';
import Navbar from './components/Navbar';

function App() {

  return (
    <>
    <Navbar />
    <AllRoutes />
    <Toaster position='top-center' duration={3000} />
    </>
  )
}

export default App
