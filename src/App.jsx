import { useEffect, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { products } from './data/products'
import './App.css'
import { supabase } from './lib/supabase'

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
function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setIsLoading(true)

    const result = isRegistering
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    setIsLoading(false)

    if (result.error) {
      setMessage(result.error.message)
      return
    }

    setMessage(
      isRegistering
        ? 'Account created. Check your email if confirmation is required.'
        : 'You are now logged in.',
    )
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Customer account</p>
        <h1>{isRegistering ? 'Create an account' : 'Welcome back'}</h1>
        <p>
          {isRegistering
            ? 'Create an account to place orders and track them.'
            : 'Log in to access your account and orders.'}
        </p>

        <label>
          Email address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength="6"
            required
          />
        </label>

        <button type="submit" disabled={isLoading}>
          {isLoading
            ? 'Please wait...'
            : isRegistering
              ? 'Create account'
              : 'Log in'}
        </button>

        {message && <p className="auth-message">{message}</p>}

        <button
          className="text-button"
          type="button"
          onClick={() => {
            setIsRegistering((currentMode) => !currentMode)
            setMessage('')
          }}
        >
          {isRegistering
            ? 'Already have an account? Log in'
            : 'New here? Create an account'}
        </button>
      </form>
    </section>
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
const [user, setUser] = useState(null)

useEffect(() => {
  supabase.auth.getUser().then(({ data }) => {
    setUser(data.user)
  })

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null)
  })

  return () => subscription.unsubscribe()
}, [])

async function handleLogout() {
  await supabase.auth.signOut()
}
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
         {user ? (
  <>
    <span className="user-email">{user.email}</span>
    <button className="logout-button" type="button" onClick={handleLogout}>
      Logout
    </button>
  </>
) : (
  <NavLink to="/login">Login</NavLink>
)}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage onAddToCart={addToCart} />} />
          <Route path="/products" element={<ProductsPage onAddToCart={addToCart} />} />
          <Route path="/cart" element={<CartPage cart={cart} onRemoveFromCart={removeFromCart} />} />
        <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App