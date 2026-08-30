import { useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { products } from './data/products'
import './App.css'

function ProductCard({ product, onAddToCart }) {
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
      <button type="button" onClick={() => onAddToCart(product)}>
        Add to cart
      </button>
    </article>
  )
}

function HomePage({ onAddToCart }) {
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
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </section>
    </>
  )
}

function ProductsPage({ onAddToCart }) {
  const [searchText, setSearchText] = useState('')

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.category}`
      .toLowerCase()
      .includes(searchText.toLowerCase()),
  )

  return (
    <section className="content-section">
      <p className="eyebrow">Catalogue</p>
      <h1>Explore our products</h1>

      <input
        className="search-input"
        type="search"
        placeholder="Search products or categories..."
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
      />

      {filteredProducts.length === 0 ? (
        <p className="empty-search">No products found. Try a different search.</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function CartPage({ cart, onRemoveFromCart }) {
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )

  if (cart.length === 0) {
    return (
      <section className="page">
        <h1>Your Cart</h1>
        <p>Your cart is empty. Add something you love.</p>
        <NavLink className="primary-link" to="/products">Browse products</NavLink>
      </section>
    )
  }

  return (
    <section className="content-section">
      <p className="eyebrow">Shopping cart</p>
      <h1>Your Cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((item) => (
            <article className="cart-item" key={item.id}>
              <div className="product-emoji">{item.emoji}</div>
              <div>
                <h3>{item.name}</h3>
                <p>Quantity: {item.quantity}</p>
              </div>
              <div className="cart-item-price">
                <strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                <button type="button" onClick={() => onRemoveFromCart(item.id)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="order-summary">
          <h2>Order summary</h2>
          <div>
            <span>Subtotal</span>
            <strong>₹{total.toLocaleString('en-IN')}</strong>
          </div>
          <p>Delivery charges and payment will be added later.</p>
          <button type="button">Continue to checkout</button>
        </aside>
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
  const [cart, setCart] = useState([])

  function addToCart(product) {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id)

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [...currentCart, { ...product, quantity: 1 }]
    })
  }

  function removeFromCart(productId) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId),
    )
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="app">
      <header className="site-header">
        <NavLink className="brand" to="/">ShopSmart</NavLink>

        <nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/cart">Cart ({cartCount})</NavLink>
          <NavLink to="/login">Login</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage onAddToCart={addToCart} />} />
          <Route path="/products" element={<ProductsPage onAddToCart={addToCart} />} />
          <Route path="/cart" element={<CartPage cart={cart} onRemoveFromCart={removeFromCart} />} />
          <Route path="/login" element={<Page title="Login" text="Customer and admin sign-in will appear here." />} />
        </Routes>
      </main>
    </div>
  )
}

export default App