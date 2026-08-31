import { useEffect, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'

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
        <strong>₹{Number(product.price).toLocaleString('en-IN')}</strong>
        <span>★ {product.rating}</span>
      </div>

      <button type="button" onClick={() => onAddToCart(product)}>
        Add to cart
      </button>
    </article>
  )
}

function HomePage({ products, onAddToCart }) {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Simple shopping, smarter choices</p>
        <h1>Everything you need, in one place.</h1>
        <p>Discover useful products at prices you’ll love.</p>
        <NavLink className="primary-link" to="/products">
          Shop products
        </NavLink>
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

        <h1>
          {isRegistering ? 'Create an account' : 'Welcome back'}
        </h1>

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

function ProductsPage({ products, onAddToCart }) {
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
        <p className="empty-search">
          No products found. Try a different search.
        </p>
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
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  )

  if (cart.length === 0) {
    return (
      <section className="page">
        <h1>Your Cart</h1>
        <p>Your cart is empty. Add something you love.</p>

        <NavLink className="primary-link" to="/products">
          Browse products
        </NavLink>
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
                <strong>
                  ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                </strong>

                <button
                  type="button"
                  onClick={() => onRemoveFromCart(item.id)}
                >
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

          <NavLink className="checkout-link" to="/checkout">
            Continue to checkout
          </NavLink>
        </aside>
      </div>
    </section>
  )
}

function CheckoutPage({ user, cart, onOrderPlaced }) {
  const [form, setForm] = useState({
    recipient_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
  })

  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  useEffect(() => {
    if (!user) return

    async function loadAddresses() {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error) {
        setAddresses(data ?? [])

        if (data?.length > 0) {
          setSelectedAddressId(String(data[0].id))
        }
      }
    }

    loadAddresses()
  }, [user])

  function updateField(event) {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }))
  }

  async function saveAddress(event) {
    event.preventDefault()

    setMessage('')
    setIsSaving(true)

    const { data, error } = await supabase
      .from('addresses')
      .insert(form)
      .select()
      .single()

    setIsSaving(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setAddresses((currentAddresses) => [data, ...currentAddresses])
    setSelectedAddressId(String(data.id))

    setMessage('Delivery address saved. It is selected for this order.')

    setForm({
      recipient_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
    })
  }

  async function placeOrder() {
    const selectedAddress = addresses.find(
      (address) => String(address.id) === selectedAddressId,
    )

    if (!selectedAddress) {
      setMessage('Please save and select a delivery address first.')
      return
    }

    setMessage('')
    setIsPlacingOrder(true)

    const subtotal = cart.reduce(
      (total, item) =>
        total + Number(item.price) * item.quantity,
      0,
    )

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        subtotal,
        shipping_address: selectedAddress,
      })
      .select()
      .single()

    if (orderError) {
      setIsPlacingOrder(false)
      setMessage(orderError.message)
      return
    }

    const orderItems = cart.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      unit_price: item.price,
      quantity: item.quantity,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    setIsPlacingOrder(false)

    if (itemsError) {
      setMessage(
        'Your order was created, but its items could not be saved.',
      )
      return
    }

    onOrderPlaced()
    setMessage(`Order #${order.id} placed successfully!`)
  }

  if (!user) {
    return (
      <section className="page">
        <h1>Sign in to check out</h1>
        <p>
          Please log in before adding a delivery address or placing an order.
        </p>

        <NavLink className="primary-link" to="/login">
          Go to Login
        </NavLink>
      </section>
    )
  }

  if (cart.length === 0 && !message) {
    return (
      <section className="page">
        <h1>Your cart is empty</h1>
        <p>Add a product before continuing to checkout.</p>

        <NavLink className="primary-link" to="/products">
          Browse products
        </NavLink>
      </section>
    )
  }

  return (
    <section className="checkout-page">
      <p className="eyebrow">Checkout</p>
      <h1>Delivery address</h1>
      <p className="checkout-intro">
        Choose a saved address or add a new one.
      </p>

      {addresses.length > 0 && (
        <div className="saved-addresses">
          <h2>Saved addresses</h2>

          {addresses.map((address) => (
            <label className="address-choice" key={address.id}>
              <input
                type="radio"
                name="selected-address"
                value={address.id}
                checked={selectedAddressId === String(address.id)}
                onChange={(event) =>
                  setSelectedAddressId(event.target.value)
                }
              />

              <span>
                <strong>{address.recipient_name}</strong>
                <br />

                {address.address_line1}, {address.city},{' '}
                {address.state} – {address.postal_code}
                <br />

                {address.phone}
              </span>
            </label>
          ))}
        </div>
      )}

      <form className="address-form" onSubmit={saveAddress}>
        <h2 className="form-heading">Add a new address</h2>

        <label>
          Full name
          <input
            name="recipient_name"
            value={form.recipient_name}
            onChange={updateField}
            required
          />
        </label>

        <label>
          Phone number
          <input
            name="phone"
            value={form.phone}
            onChange={updateField}
            required
          />
        </label>

        <label className="full-width">
          Address line 1
          <input
            name="address_line1"
            value={form.address_line1}
            onChange={updateField}
            required
          />
        </label>

        <label className="full-width">
          Address line 2 <span>(optional)</span>
          <input
            name="address_line2"
            value={form.address_line2}
            onChange={updateField}
          />
        </label>

        <label>
          City
          <input
            name="city"
            value={form.city}
            onChange={updateField}
            required
          />
        </label>

        <label>
          State
          <input
            name="state"
            value={form.state}
            onChange={updateField}
            required
          />
        </label>

        <label>
          PIN code
          <input
            name="postal_code"
            value={form.postal_code}
            onChange={updateField}
            required
          />
        </label>

        <button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save delivery address'}
        </button>
      </form>

      {cart.length > 0 && (
        <button
          className="place-order-button"
          type="button"
          onClick={placeOrder}
          disabled={isPlacingOrder}
        >
          {isPlacingOrder ? 'Placing order...' : 'Place order'}
        </button>
      )}

      {message && <p className="address-message">{message}</p>}
    </section>
  )
}

function OrdersPage({ user }) {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    async function loadOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items (*)')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to load orders:', error)
      }

      setOrders(data ?? [])
      setIsLoading(false)
    }

    loadOrders()
  }, [user])

  if (!user) {
    return (
      <section className="page">
        <h1>Sign in to view orders</h1>
        <p>Your order history is available after logging in.</p>

        <NavLink className="primary-link" to="/login">
          Go to Login
        </NavLink>
      </section>
    )
  }

  if (isLoading) {
    return (
      <section className="page">
        <p>Loading your orders...</p>
      </section>
    )
  }

  if (orders.length === 0) {
    return (
      <section className="page">
        <h1>Your Orders</h1>
        <p>You have not placed an order yet.</p>

        <NavLink className="primary-link" to="/products">
          Start shopping
        </NavLink>
      </section>
    )
  }

  return (
    <section className="orders-page">
      <p className="eyebrow">Order history</p>
      <h1>Your Orders</h1>

      <div className="orders-list">
        {orders.map((order) => (
          <article className="order-card" key={order.id}>
            <div className="order-card-header">
              <div>
                <p>Order #{order.id}</p>

                <span>
                  {new Date(order.created_at).toLocaleDateString(
                    'en-IN',
                  )}
                </span>
              </div>

              <span className={`status status-${order.status}`}>
                {order.status}
              </span>
            </div>

            <div className="order-products">
              {(order.order_items ?? []).map((item) => (
                <div key={item.id}>
                  <span>
                    {item.product_name} × {item.quantity}
                  </span>

                  <strong>
                    ₹
                    {(
                      Number(item.unit_price) * item.quantity
                    ).toLocaleString('en-IN')}
                  </strong>
                </div>
              ))}
            </div>

            <div className="order-total">
              <span>Total</span>

              <strong>
                ₹
                {Number(order.subtotal).toLocaleString('en-IN')}
              </strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function AdminPage() {
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  useEffect(() => {
    async function loadAdminData() {
      setIsLoading(true)

      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Admin dashboard error:', error)
        setIsLoading(false)
        return
      }

      const totalRevenue = (ordersData ?? []).reduce(
        (total, order) =>
          total + Number(order.subtotal || 0),
        0,
      )

      const uniqueCustomers = new Set(
        (ordersData ?? []).map((order) => order.user_id),
      ).size

      setOrders(ordersData ?? [])

      setStats({
        totalOrders: ordersData?.length ?? 0,
        totalCustomers: uniqueCustomers,
        totalRevenue,
      })

      setIsLoading(false)
    }

    loadAdminData()
  }, [])

  async function updateOrderStatus(orderId, newStatus) {
    setUpdatingOrderId(orderId)

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      console.error('Failed to update order:', error)
      alert(`Failed to update order status: ${error.message}`)
      setUpdatingOrderId(null)
      return
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus }
          : order,
      ),
    )

    setUpdatingOrderId(null)
  }

  if (isLoading) {
    return (
      <section className="page">
        <p>Loading admin dashboard...</p>
      </section>
    )
  }

  return (
    <section className="admin-page">
      <div className="admin-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Admin Dashboard</h1>
          <p>Manage your store and monitor business activity.</p>
        </div>
      </div>

      <div className="admin-stats">
        <article className="admin-stat-card">
          <span>Total Orders</span>
          <strong>{stats.totalOrders}</strong>
        </article>

        <article className="admin-stat-card">
          <span>Total Customers</span>
          <strong>{stats.totalCustomers}</strong>
        </article>

        <article className="admin-stat-card">
          <span>Total Revenue</span>

          <strong>
            ₹{stats.totalRevenue.toLocaleString('en-IN')}
          </strong>
        </article>
      </div>

      <section className="admin-orders">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Order management</p>
            <h2>All Orders</h2>
          </div>
        </div>

        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order.id}>
                <div className="order-card-header">
                  <div>
                    <p>Order #{order.id}</p>

                    <span>
                      {new Date(
                        order.created_at,
                      ).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <div className="admin-order-status">
                    <select
                      value={order.status || 'pending'}
                      onChange={(event) =>
                        updateOrderStatus(
                          order.id,
                          event.target.value,
                        )
                      }
                      disabled={updatingOrderId === order.id}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">
                        Processing
                      </option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">
                        Delivered
                      </option>
                      <option value="cancelled">
                        Cancelled
                      </option>
                    </select>

                    {updatingOrderId === order.id && (
                      <small>Updating...</small>
                    )}
                  </div>
                </div>

                <div className="order-total">
                  <span>Total</span>

                  <strong>
                    ₹
                    {Number(
                      order.subtotal,
                    ).toLocaleString('en-IN')}
                  </strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}

function App() {
  const [cart, setCart] = useState([])
  const [products, setProducts] = useState([])
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Load current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load products from Supabase
  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id')

      if (error) {
        console.error('Failed to load products:', error)
        return
      }

      setProducts(data ?? [])
    }

    loadProducts()
  }, [])

  // Check admin role
  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      return
    }

    async function checkAdminRole() {
      console.log('Checking admin for:', user.id)

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      console.log('Admin data:', data)
      console.log('Admin error:', error)

      setIsAdmin(!error && data?.role === 'admin')
    }

    checkAdminRole()
  }, [user])

  async function handleLogout() {
    await supabase.auth.signOut()
    setIsAdmin(false)
  }

  function addToCart(product) {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id,
      )

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        )
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ]
    })
  }

  function removeFromCart(productId) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId),
    )
  }

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0,
  )

  return (
    <div className="app">
      <header className="site-header">
        <NavLink className="brand" to="/">
          ShopSmart
        </NavLink>

        <nav>
          <NavLink to="/">Home</NavLink>

          <NavLink to="/products">Products</NavLink>

          <NavLink to="/cart">
            Cart ({cartCount})
          </NavLink>

          {user && <NavLink to="/orders">Orders</NavLink>}

          {isAdmin && <NavLink to="/admin">Admin</NavLink>}

          {user ? (
            <>
              <span className="user-email">{user.email}</span>

              <button
                className="logout-button"
                type="button"
                onClick={handleLogout}
              >
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
          <Route
            path="/"
            element={
              <HomePage
                products={products}
                onAddToCart={addToCart}
              />
            }
          />

          <Route
            path="/products"
            element={
              <ProductsPage
                products={products}
                onAddToCart={addToCart}
              />
            }
          />

          <Route
            path="/cart"
            element={
              <CartPage
                cart={cart}
                onRemoveFromCart={removeFromCart}
              />
            }
          />

          <Route
            path="/orders"
            element={<OrdersPage user={user} />}
          />

          <Route
            path="/checkout"
            element={
              <CheckoutPage
                user={user}
                cart={cart}
                onOrderPlaced={() => setCart([])}
              />
            }
          />

          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/admin"
            element={
              isAdmin ? (
                <AdminPage />
              ) : (
                <HomePage
                  products={products}
                  onAddToCart={addToCart}
                />
              )
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App