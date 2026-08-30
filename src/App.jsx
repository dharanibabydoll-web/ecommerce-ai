import { NavLink, Route, Routes } from 'react-router-dom'
import './App.css'

function Page({ title, text }) {
  return (
    <section className="page">
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  )
}

function App() {
  return (
    <div className="app">
      <header className="site-header">
        <NavLink className="brand" to="/">ShopSmart</NavLink>

        <nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/cart">Cart</NavLink>
          <NavLink to="/login">Login</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Page title="Welcome to ShopSmart" text="Your online shopping destination." />} />
          <Route path="/products" element={<Page title="Products" text="Our product catalogue will appear here." />} />
          <Route path="/cart" element={<Page title="Your Cart" text="Your selected products will appear here." />} />
          <Route path="/login" element={<Page title="Login" text="Customer and admin sign-in will appear here." />} />
        </Routes>
      </main>
    </div>
  )
}

export default App