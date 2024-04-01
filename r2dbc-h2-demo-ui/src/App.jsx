import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'
import MyGrid from './components/MyGrid'
import MyWebSocket from './components/MyWebSocket'
import ClientSideGrid from './components/ClientSideGrid'
import UpdateClientSide from './components/UpdateClientSide'
import InfiniteRowType from './components/InfiniteRowType'
import Trades from './components/Trades'

function App() {
  const [count, setCount] = useState(0)

  return (
    // <MyGrid/>
    // <ClientSideGrid/>
    // <UpdateClientSide/>
    // <MyWebSocket/>
    <Trades/>
  )
}

export default App
