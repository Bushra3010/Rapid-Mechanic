import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// GitHub Pages SPA fallback: 404.html redirects deep links to ?r=<path>; restore it here.
const r = new URLSearchParams(location.search).get('r')
if (r) history.replaceState(null, '', import.meta.env.BASE_URL + r.replace(/^\//, ''))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
