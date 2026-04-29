import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// TO JEST PUNKT STARTOWY FRONTENDU
// React bierze element o id "root" z pliku index.html i tam wstrzykuje całą aplikację.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
