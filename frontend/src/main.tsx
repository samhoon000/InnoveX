import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from '@/hooks/use-auth'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster richColors closeButton position="top-center" />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
