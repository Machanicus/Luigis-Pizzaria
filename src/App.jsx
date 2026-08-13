import { useCallback, useMemo, useState } from 'react'
import pizzaGraphic from './assets/pizza.svg'
import './App.css'

// Menu data is kept in one place so the UI, pricing, and cart stay in sync.
const pizzaMenu = [
  {
    id: 'margherita',
    name: 'Margherita',
    description: 'Tomato, mozzarella, basil, extra virgin olive oil.',
    price: 10,
  },
  {
    id: 'pepperoni',
    name: 'Pepperoni',
    description: 'Spicy pepperoni, mozzarella, tomato sauce.',
    price: 12,
  },
  {
    id: 'veggie',
    name: 'Veggie Delight',
    description: 'Bell peppers, mushrooms, olives, fresh spinach.',
    price: 11,
  },
  {
    id: 'meat-lovers',
    name: 'Meat Lovers',
    description: 'Pepperoni, sausage, bacon, ham, and extra cheese.',
    price: 14,
  },
]

const sizeModifiers = {
  small: 0,
  medium: 2,
  large: 4,
}

// Static lookup tables avoid repeated array scans during render and cart updates.
const toppings = [
  { id: 'extra-cheese', label: 'Extra cheese', price: 1 },
  { id: 'sausage', label: 'Italian sausage', price: 1.5 },
  { id: 'jalapenos', label: 'Jalapeños', price: 1 },
  { id: 'mushrooms', label: 'Mushrooms', price: 0.9 },
]

const formatPrice = (value) => `$${Number(value).toFixed(2)}`

const toppingPriceLookup = new Map(toppings.map((topping) => [topping.id, topping.price]))
const toppingLabelLookup = new Map(toppings.map((topping) => [topping.id, topping.label]))

const getItemLineTotal = (item) => {
  const base = item.pizza.price + sizeModifiers[item.size]
  const toppingsTotal = item.toppings.reduce(
    (sum, toppingId) => sum + (toppingPriceLookup.get(toppingId) || 0),
    0,
  )

  return (base + toppingsTotal) * item.quantity
}

function MenuCard({ pizza, onAddToCart }) {
  return (
    <article className="menu-card">
      <div>
        <h3>{pizza.name}</h3>
        <p className="menu-description">{pizza.description}</p>
      </div>
      <div className="card-footer">
        <span className="price">{formatPrice(pizza.price)}</span>
        <button type="button" onClick={() => onAddToCart(pizza)}>
          Add
        </button>
      </div>
    </article>
  )
}

function CartItemCard({ item, onUpdateItem, onRemoveItem }) {
  const itemLineTotal = getItemLineTotal(item)

  return (
    <div className="cart-item">
      <div className="item-main">
        <div>
          <h3>{item.pizza.name}</h3>
          <p>{formatPrice(itemLineTotal)}</p>
        </div>
        <button type="button" className="remove" onClick={() => onRemoveItem(item.id)}>
          Remove
        </button>
      </div>

      <div className="item-controls">
        <label>
          Size
          <select
            value={item.size}
            onChange={(event) => onUpdateItem(item.id, { size: event.target.value })}
          >
            {Object.keys(sizeModifiers).map((size) => (
              <option key={size} value={size}>
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Quantity
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(event) =>
              onUpdateItem(item.id, {
                quantity: Math.max(1, Number(event.target.value) || 1),
              })
            }
          />
        </label>
      </div>

      <fieldset className="toppings-group">
        <legend>Extra toppings</legend>
        {toppings.map((topping) => (
          <label key={topping.id} className="topping-option">
            <input
              type="checkbox"
              checked={item.toppings.includes(topping.id)}
              onChange={(event) => {
                const selected = event.target.checked
                onUpdateItem(item.id, {
                  toppings: selected
                    ? [...item.toppings, topping.id]
                    : item.toppings.filter((id) => id !== topping.id),
                })
              }}
            />
            <span>{topping.label}</span>
            <small>{formatPrice(topping.price)}</small>
          </label>
        ))}
      </fieldset>
    </div>
  )
}

function ReviewModal({
  customerName,
  phone,
  address,
  isCarryout,
  cart,
  itemTotal,
  taxAmount,
  deliveryFee,
  gratuityAmount,
  orderTotal,
  paymentMethodLabel,
  onClose,
  onConfirm,
}) {
  return (
    <div className="review-modal-backdrop" role="presentation">
      <div className="review-modal" role="dialog" aria-modal="true">
        <div className="review-modal-header">
          <div>
            <p className="eyebrow">Review order</p>
            <h2>Please verify your details</h2>
          </div>
          <button type="button" className="review-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="review-sections">
          <section>
            <h3>Customer</h3>
            <p>{customerName || 'No name provided'}</p>
            <p>{phone || 'No phone provided'}</p>
            {!isCarryout && <p>{address || 'No address provided'}</p>}
          </section>

          <section>
            <h3>Order</h3>
            <div className="review-items">
              {cart.map((item) => (
                <div key={item.id} className="review-item">
                  <div>
                    <strong>{item.quantity} × {item.pizza.name}</strong>
                    <p>{item.size} size</p>
                    {item.toppings.length > 0 && (
                      <p>
                        {item.toppings
                          .map((toppingId) => toppingLabelLookup.get(toppingId))
                          .join(', ')}
                      </p>
                    )}
                  </div>
                  <span>{formatPrice(getItemLineTotal(item))}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3>Payment</h3>
            <p>{paymentMethodLabel}</p>
            <p>{isCarryout ? 'Carryout' : 'Delivery'}</p>
          </section>

          <section>
            <h3>Totals</h3>
            <div className="review-total-row">
              <span>Items</span>
              <span>{formatPrice(itemTotal)}</span>
            </div>
            <div className="review-total-row">
              <span>Sales tax</span>
              <span>{formatPrice(taxAmount)}</span>
            </div>
            <div className="review-total-row">
              <span>Delivery fee</span>
              <span>{formatPrice(isCarryout ? 0 : deliveryFee)}</span>
            </div>
            <div className="review-total-row">
              <span>Gratuity</span>
              <span>{formatPrice(gratuityAmount)}</span>
            </div>
            <div className="review-total-row total">
              <span>Order total</span>
              <span>{formatPrice(orderTotal)}</span>
            </div>
          </section>
        </div>

        <div className="review-actions">
          <button type="button" className="secondary review-cancel" onClick={onClose}>
            Back
          </button>
          <button type="button" className="primary review-confirm" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

function SuccessModal({ estimatedWaitTime, onClose }) {
  return (
    <div className="review-modal-backdrop" role="presentation">
      <div className="success-modal" role="dialog" aria-modal="true">
        <p className="eyebrow">Luigi's Pizzaria</p>
        <h2>Thank you!</h2>
        <p className="success-message">Your order will be ready in {estimatedWaitTime}.</p>
        <button type="button" className="primary" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  )
}

function OrderSummaryCard({
  customerName,
  address,
  phone,
  orderType,
  paymentMethod,
  showGratuityInput,
  gratuityInput,
  validationMessage,
  gratuityPercentageOptions,
  itemTotal,
  salesTaxRate,
  taxAmount,
  gratuityAmount,
  deliveryFee,
  orderTotal,
  deliveryEstimate,
  estimatedWaitTime,
  isCarryout,
  onUpdateCustomerName,
  onUpdateAddress,
  onUpdatePhone,
  onSetOrderType,
  onSetPaymentMethod,
  onToggleGratuityInput,
  onPresetGratuity,
  onUpdateGratuityInput,
  onPlaceOrder,
}) {
  return (
    <div className="summary-card">
      <div className="summary-card-header">
        <div>
          <p className="summary-label">Order total</p>
          <p className="summary-subtitle">{deliveryEstimate}</p>
        </div>
        <strong>{formatPrice(orderTotal)}</strong>
      </div>

      <div className="order-type-toggle">
        <button
          type="button"
          className={isCarryout ? 'toggle-pill' : 'toggle-pill active'}
          onClick={() => onSetOrderType('delivery')}
        >
          Delivery
        </button>
        <span className="toggle-separator">OR</span>
        <button
          type="button"
          className={isCarryout ? 'toggle-pill active' : 'toggle-pill'}
          onClick={() => onSetOrderType('carryout')}
        >
          Carryout
        </button>
      </div>

      <div className="checkout-form">
        <label>
          <span>Name</span>
          <input
            type="text"
            value={customerName}
            onChange={(event) => onUpdateCustomerName(event.target.value)}
            placeholder="Enter your name"
          />
        </label>
        {!isCarryout && (
          <label>
            <span>Delivery address</span>
            <input
              type="text"
              value={address}
              onChange={(event) => onUpdateAddress(event.target.value)}
              placeholder="Enter delivery address"
            />
          </label>
        )}
        <label>
          <span>Phone</span>
          <input
            type="tel"
            value={phone}
            onChange={(event) => onUpdatePhone(event.target.value)}
            placeholder="(555) 555-1234"
          />
        </label>
      </div>

      {validationMessage && (
        <div className="validation-banner" role="alert">
          <span className="validation-title">Luigi's Pizzaria</span>
          <span>{validationMessage}</span>
        </div>
      )}

      <div className="payment-method-toggle">
        <button
          type="button"
          className={paymentMethod === 'paypal' ? 'payment-pill active' : 'payment-pill'}
          onClick={() => onSetPaymentMethod('paypal')}
        >
          PayPal
        </button>
        <button
          type="button"
          className={paymentMethod === 'credit' ? 'payment-pill active' : 'payment-pill'}
          onClick={() => onSetPaymentMethod('credit')}
        >
          Credit card
        </button>
        <button
          type="button"
          className={paymentMethod === 'affirm' ? 'payment-pill active' : 'payment-pill'}
          onClick={() => onSetPaymentMethod('affirm')}
        >
          Affirm
        </button>
      </div>

      <div className="gratuity-row">
        <div className="gratuity-controls">
          <button
            type="button"
            className="gratuity-button"
            onClick={() => onToggleGratuityInput()}
          >
            {showGratuityInput ? 'Hide gratuity' : 'Add gratuity'}
          </button>

          {gratuityPercentageOptions.map((percentage) => (
            <button
              key={percentage}
              type="button"
              className="gratuity-preset"
              onClick={() => onPresetGratuity(percentage, itemTotal)}
            >
              {percentage}%
            </button>
          ))}
        </div>

        {showGratuityInput && (
          <label className="gratuity-input-group">
            <span>Gratuity amount</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={gratuityInput}
              onChange={(event) => onUpdateGratuityInput(event.target.value)}
              placeholder="Enter amount"
            />
          </label>
        )}
      </div>

      <div className="order-breakdown">
        <div className="breakdown-title">
          <span>Your order</span>
          <span>{formatPrice(itemTotal)}</span>
        </div>
        <div className="breakdown-item">
          <span>Sales tax ({(salesTaxRate * 100).toFixed(2)}%)</span>
          <span>{formatPrice(taxAmount)}</span>
        </div>
        <div className="breakdown-item">
          <span>Delivery fee</span>
          <span>{formatPrice(isCarryout ? 0 : deliveryFee)}</span>
        </div>
        <div className="breakdown-item">
          <span>Gratuity</span>
          <span>{formatPrice(gratuityAmount)}</span>
        </div>
      </div>

      <button
        type="button"
        className="primary checkout-button"
        onClick={onPlaceOrder}
        disabled={!paymentMethod}
      >
        Place order
      </button>
    </div>
  )
}

function App() {
  const [cart, setCart] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [orderType, setOrderType] = useState('delivery')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [showGratuityInput, setShowGratuityInput] = useState(false)
  const [gratuityInput, setGratuityInput] = useState('')
  const [showOrderReview, setShowOrderReview] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  const gratuityPercentageOptions = [5, 10, 15]

  const addToCart = useCallback((pizza) => {
    setCart((current) => [
     ...current,
     {
       id: `${pizza.id}-${crypto.randomUUID()}`,
       pizza,
       size: 'medium',
       quantity: 1,
       toppings: [],
     },
   ])
  }, [])

  const updateItem = useCallback((id, changes) => {
    setCart((current) =>
      current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    )
  }, [])

  const removeItem = useCallback((id) => {
    setCart((current) => current.filter((item) => item.id !== id))
  }, [])

  const deliveryFee = 4

  const getSalesTaxRate = (addressValue) => {
    if (!addressValue) {
      return 0.075
    }

    const normalized = addressValue.toLowerCase()
    if (/\b(california|ca)\b/.test(normalized)) return 0.0825
    if (/\b(new york|ny)\b/.test(normalized)) return 0.08875
    if (/\b(texas|tx)\b/.test(normalized)) return 0.0825
    if (/\b(illinois|il)\b/.test(normalized)) return 0.0875
    if (/\b(florida|fl)\b/.test(normalized)) return 0.07
    if (/\b(washington|wa)\b/.test(normalized)) return 0.095
    return 0.075
  }

  // Keep summing logic in one helper so totals stay consistent in the cart, review modal, and order summary.
  const itemTotal = useMemo(() => {
    return cart.reduce((total, item) => total + getItemLineTotal(item), 0)
  }, [cart])

  const salesTaxRate = useMemo(() => getSalesTaxRate(address), [address])
  const taxAmount = useMemo(() => itemTotal * salesTaxRate, [itemTotal, salesTaxRate])
  const gratuityAmount = useMemo(() => Math.max(0, Number(gratuityInput) || 0), [gratuityInput])
  const isCarryout = orderType === 'carryout'
  const orderTotal = useMemo(
    () => itemTotal + taxAmount + (isCarryout ? 0 : deliveryFee) + gratuityAmount,
    [itemTotal, taxAmount, isCarryout, deliveryFee, gratuityAmount],
  )

  const totalPizzas = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  )

  const estimatedWaitTime = useMemo(() => {
    if (isCarryout || totalPizzas === 0) {
      return '14–21 mins'
    }

    const baseMin = Math.max(20 + totalPizzas * 4, 25)
    const baseMax = baseMin + 10 + Math.min(totalPizzas * 3, 20)
    const randomShift = Math.floor(Math.random() * 4)

    const minTime = Math.max(18, Math.round((baseMin + randomShift) * 0.7))
    const maxTime = Math.max(minTime + 4, Math.round((baseMax + randomShift) * 0.7))

    return `${minTime}–${maxTime} mins`
  }, [isCarryout, totalPizzas])

  const deliveryEstimate = useMemo(() => {
    if (totalPizzas === 0) {
      return isCarryout ? 'Estimated ready in: 14–21 mins' : 'Estimated ready in: 18–26 mins'
    }

    if (isCarryout) {
      return 'Estimated ready in: 14–21 mins'
    }

    return `Estimated ready in: ${estimatedWaitTime}`
  }, [estimatedWaitTime, isCarryout, totalPizzas])

  const handlePlaceOrder = useCallback(() => {
    if (!customerName || !phone || cart.length === 0 || (!isCarryout && !address)) {
      setValidationMessage('Please add at least one pizza and fill in your contact details.')
      return
    }

    if (!paymentMethod) {
      setValidationMessage('Please select a payment method before placing your order.')
      return
    }

    setValidationMessage('')
    setShowOrderReview(true)
  }, [address, cart.length, customerName, isCarryout, paymentMethod, phone])

  const confirmOrder = useCallback(() => {
    setShowOrderReview(false)
    setShowSuccessMessage(true)
    setCart([])
    setCustomerName('')
    setAddress('')
    setPhone('')
    setOrderType('delivery')
    setPaymentMethod('')
    setGratuityInput('')
    setShowGratuityInput(false)
    setValidationMessage('')
  }, [])

  const paymentMethodLabel = {
    paypal: 'PayPal',
    credit: 'Credit card',
    affirm: 'Affirm',
  }[paymentMethod]

  return (
    <main className="app-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">Luigi's Pizzaria</p>
          <h1>Build your perfect pizza</h1>
          <p className="hero-copy">
            Choose delivery or carryout, then build your pizza with fresh toppings
            and fast pickup.
          </p>
        </div>
        <div className="hero-graphic">
          <img src={pizzaGraphic} alt="Pizza graphic" />
        </div>
      </header>

      <section className="about-card">
        <div>
          <p className="eyebrow">About us</p>
          <h2>Fresh pizza from your neighborhood spot</h2>
          <p>
            At Luigi's Pizzaria, we make our dough by hand every morning and pile on
            ripe tomatoes and cheese from nearby producers. We began as a small local
            place where neighbors came together, and we still aim to make every order
            feel warm and welcoming.
          </p>
          <p>
            Whether you pick delivery or carryout, we keep things simple and honest.
            Every pizza is finished with fresh herbs and our house sauce, then sent out
            straight from our oven.
          </p>
        </div>
      </section>

      <section className="grid-layout">
        <section className="menu-panel">
          <div className="panel-header">
            <h2>Pizza menu</h2>
            <p>Tap any pizza to add it to your cart.</p>
          </div>

          <div className="menu-list">
            {pizzaMenu.map((pizza) => (
              <MenuCard key={pizza.id} pizza={pizza} onAddToCart={addToCart} />
            ))}
          </div>
        </section>

        <section className="cart-panel">
          <div className="panel-header">
            <h2>Your order</h2>
            <p>{cart.length ? `${cart.length} item(s) in cart` : 'Cart is empty'}</p>
          </div>

          <div className="cart-list">
            {cart.length === 0 && (
              <p className="empty-state">Start by adding a pizza from the menu.</p>
            )}

            {cart.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onUpdateItem={updateItem}
                onRemoveItem={removeItem}
              />
            ))}
          </div>

          <OrderSummaryCard
            customerName={customerName}
            address={address}
            phone={phone}
            orderType={orderType}
            paymentMethod={paymentMethod}
            showGratuityInput={showGratuityInput}
            gratuityInput={gratuityInput}
            validationMessage={validationMessage}
            gratuityPercentageOptions={gratuityPercentageOptions}
            itemTotal={itemTotal}
            salesTaxRate={salesTaxRate}
            taxAmount={taxAmount}
            gratuityAmount={gratuityAmount}
            deliveryFee={deliveryFee}
            orderTotal={orderTotal}
            deliveryEstimate={deliveryEstimate}
            isCarryout={isCarryout}
            onUpdateCustomerName={(value) => {
              setCustomerName(value)
              setValidationMessage('')
            }}
            onUpdateAddress={(value) => {
              setAddress(value)
              setValidationMessage('')
            }}
            onUpdatePhone={(value) => {
              setPhone(value)
              setValidationMessage('')
            }}
            onSetOrderType={(value) => setOrderType(value)}
            onSetPaymentMethod={(value) => setPaymentMethod(value)}
            onToggleGratuityInput={() => setShowGratuityInput((current) => !current)}
            onPresetGratuity={(percentage, subtotal) => {
              setShowGratuityInput(true)
              setGratuityInput((subtotal * (percentage / 100)).toFixed(2))
            }}
            onUpdateGratuityInput={(value) => setGratuityInput(value)}
            onPlaceOrder={handlePlaceOrder}
          />
        </section>
      </section>

      {showOrderReview && (
        <ReviewModal
          customerName={customerName}
          phone={phone}
          address={address}
          isCarryout={isCarryout}
          cart={cart}
          itemTotal={itemTotal}
          taxAmount={taxAmount}
          deliveryFee={deliveryFee}
          gratuityAmount={gratuityAmount}
          orderTotal={orderTotal}
          paymentMethodLabel={paymentMethodLabel}
          onClose={() => setShowOrderReview(false)}
          onConfirm={confirmOrder}
        />
      )}

      {showSuccessMessage && (
        <SuccessModal
          estimatedWaitTime={estimatedWaitTime}
          onClose={() => setShowSuccessMessage(false)}
        />
      )}
    </main>
  )
}

export default App
