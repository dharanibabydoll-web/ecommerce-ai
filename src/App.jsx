import { NavLink, Route, Routes } from 'react-router-dom'
import { products } from './data/products'
import './App.css'

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-emoji">{product.emoji}</div>
      <p className="product-category">{product.category}</p>
      <h3>{product.name}</h3>
      <p className="product-description">{product.description}</p>
      <div className="product-footer">
        <strong>₹{product.price.toLocaleString('en-IN')}</strong>
        <span>★ {product.rating}</span>
      </div>
      <button type="button">Add to cart</button>
    </article>
  )
}

function HomePage() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Simple shopping, smarter choices</p>
        <h1>Everything you need, in one place.</h1>
        <p>Discover useful products at prices you’ll love.</p>
        <NavLink className="primary-link" to="/products">Shop products</NavLink>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Featured products</p>
            <h2>Popular right now</h2>
          </div>
          <NavLink to="/products">View all products</NavLink>
        </div>

        <div className="product-grid">
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  )
}

function ProductsPage() {
  return (
    <section className="content-section">
      <p className="eyebrow">Catalogue</p>
      <h1>Explore our products</h1>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

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
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/cart" element={<Page title="Your Cart" text="Your selected products will appear here." />} />
          <Route path="/login" element={<Page title="Login" text="Customer and admin sign-in will appear here." />} />
        </Routes>
      </main>
    </div>
  )
}

export default App