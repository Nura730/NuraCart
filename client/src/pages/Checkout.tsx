import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { dummyAddressData } from "../assets/assets";
import { ShoppingBagIcon, MapPinIcon, CreditCardIcon, LandmarkIcon, TicketIcon, ArrowRightIcon, ChevronLeftIcon } from "lucide-react";
import toast from "react-hot-toast";

interface Address {
  _id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

const Checkout = () => {
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";
  const navigate = useNavigate();
  const { items, cartTotal, clearCart } = useCart();

  const [addresses] = useState<Address[]>(() => {
    const saved = localStorage.getItem("app_addresses");
    return saved ? JSON.parse(saved) : dummyAddressData;
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault);
      setSelectedAddressId(defaultAddr ? defaultAddr._id : addresses[0]._id);
    }
  }, [addresses]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-app-cream flex-center px-4">
        <div className="bg-white rounded-3xl p-10 text-center border border-app-border max-w-md w-full shadow-xs">
          <ShoppingBagIcon className="size-16 text-app-text-light/35 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-app-green mb-2">Your Cart is empty</h2>
          <p className="text-sm text-app-text-light mb-6">
            You cannot proceed to checkout with an empty cart. Fill it up with organic goodness!
          </p>
          <Link
            to="/products"
            className="inline-flex px-6 py-2.5 bg-app-green text-white text-sm font-semibold rounded-full hover:bg-app-green-light transition-all"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);
  const deliveryFee = appliedCoupon === "FREESHIP" || cartTotal > 20 ? 0 : 1.99;
  const tax = cartTotal * 0.08;
  const discount = cartTotal * (discountPercent / 100);
  const finalTotal = cartTotal + deliveryFee + tax - discount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCoupon = coupon.trim().toUpperCase();
    if (cleanCoupon === "NURA20") {
      setDiscountPercent(20);
      setAppliedCoupon("NURA20");
      toast.success("Coupon NURA20 applied! 20% discount added.");
    } else if (cleanCoupon === "FREESHIP") {
      setDiscountPercent(0);
      setAppliedCoupon("FREESHIP");
      toast.success("Coupon FREESHIP applied! Free delivery added.");
    } else {
      toast.error("Invalid coupon code.");
    }
    setCoupon("");
  };

  const handleRemoveCoupon = () => {
    setDiscountPercent(0);
    setAppliedCoupon("");
    toast.success("Coupon removed.");
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      toast.error("Please add or select a delivery address.");
      return;
    }

    if (paymentMethod === "card") {
      if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        toast.error("Please fill in all credit card details.");
        return;
      }
    }

    setIsSubmitting(true);
    const loadingToastId = toast.loading("Placing your order...");

    setTimeout(() => {
      // Create new order
      const newOrderId = "ord_" + Math.random().toString(36).substr(2, 9);
      const newOrder = {
        _id: newOrderId,
        shippingAddress: {
          label: selectedAddress.label,
          address: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zip: selectedAddress.zip,
          lat: 40.7128,
          lng: -74.006,
        },
        liveLocation: {
          lat: 40.7128,
          lng: -74.006,
          updatedAt: new Date().toISOString(),
        },
        user: {
          _id: "user_123",
          name: "Nura",
          email: "nura@example.com",
        },
        items: items.map((item) => ({
          product: item.product._id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
          unit: item.product.unit,
        })),
        paymentMethod,
        subtotal: cartTotal,
        deliveryFee,
        tax,
        total: finalTotal,
        status: "Placed",
        statusHistory: [
          {
            status: "Placed",
            note: "Order placed successfully",
            timestamp: new Date().toISOString(),
          },
        ],
        deliveryOtp: Math.floor(100000 + Math.random() * 900000).toString(),
        isPaid: paymentMethod === "card",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save order
      const savedOrders = localStorage.getItem("app_orders");
      const currentOrders = savedOrders ? JSON.parse(savedOrders) : [];
      localStorage.setItem("app_orders", JSON.stringify([newOrder, ...currentOrders]));

      toast.dismiss(loadingToastId);
      toast.success("Order placed successfully! 🛒🎉");
      clearCart();
      setIsSubmitting(false);
      navigate(`/orders/${newOrderId}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-app-cream py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-1 text-sm text-app-text-light hover:text-app-green mb-6 transition-colors"
        >
          <ChevronLeftIcon className="size-4" /> Back to Products
        </Link>

        <h1 className="text-2xl font-semibold text-app-green mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left panel - details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery address card */}
            <div className="bg-white rounded-2xl p-6 border border-app-border">
              <h3 className="text-lg font-semibold text-app-green mb-4 flex items-center gap-2">
                <MapPinIcon className="size-5 text-app-orange" /> Shipping Address
              </h3>

              {addresses.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-app-text-light mb-4">No saved addresses found.</p>
                  <Link
                    to="/addresses"
                    className="inline-flex px-4 py-2 bg-app-green text-white text-xs font-semibold rounded-lg hover:bg-app-green-light"
                  >
                    Manage Addresses
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedAddressId === addr._id
                          ? "border-app-green bg-green-50/10 ring-1 ring-app-green"
                          : "border-app-border hover:bg-app-cream"
                      }`}
                    >
                      <input
                        type="radio"
                        name="checkout_address"
                        checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id)}
                        className="mt-1 text-app-green focus:ring-app-green size-4"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-sm text-app-green block mb-1">
                          {addr.label} {addr.isDefault && "(Default)"}
                        </span>
                        <span className="text-app-text">{addr.address}</span>
                        <span className="text-app-text-light block mt-0.5">
                          {addr.city}, {addr.state} {addr.zip}
                        </span>
                      </div>
                    </label>
                  ))}
                  <div className="flex justify-end pt-2">
                    <Link
                      to="/addresses"
                      className="text-xs font-semibold text-app-orange hover:text-app-orange-dark transition-colors"
                    >
                      + Manage Addresses
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-2xl p-6 border border-app-border">
              <h3 className="text-lg font-semibold text-app-green mb-4 flex items-center gap-2">
                <CreditCardIcon className="size-5 text-app-orange" /> Payment Method
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "cash"
                      ? "border-app-green bg-green-50/10 ring-1 ring-app-green"
                      : "border-app-border hover:bg-app-cream"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                    className="text-app-green focus:ring-app-green size-4"
                  />
                  <LandmarkIcon className="size-5 text-app-green" />
                  <div className="text-xs">
                    <span className="font-semibold text-sm text-app-green block">Cash on Delivery</span>
                    <span className="text-app-text-light">Pay when courier arrives</span>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "card"
                      ? "border-app-green bg-green-50/10 ring-1 ring-app-green"
                      : "border-app-border hover:bg-app-cream"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    className="text-app-green focus:ring-app-green size-4"
                  />
                  <CreditCardIcon className="size-5 text-app-orange" />
                  <div className="text-xs">
                    <span className="font-semibold text-sm text-app-green block">Credit/Debit Card</span>
                    <span className="text-app-text-light">Secure mock online payment</span>
                  </div>
                </label>
              </div>

              {paymentMethod === "card" && (
                <div className="mt-6 border-t border-app-border pt-6 space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-app-text mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-app-cream rounded-xl border border-app-border focus:border-app-green focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-app-text mb-1">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-app-cream rounded-xl border border-app-border focus:border-app-green focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-app-text mb-1">CVV</label>
                      <input
                        type="password"
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-app-cream rounded-xl border border-app-border focus:border-app-green focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right panel - summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-app-border space-y-4">
              <h3 className="text-lg font-semibold text-app-green mb-2">Order Summary</h3>

              <div className="divide-y divide-app-border max-h-48 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.product._id} className="flex justify-between py-2.5 text-xs">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="font-medium text-app-green truncate">{item.product.name}</p>
                      <p className="text-app-text-light">{item.quantity} x {item.product.unit}</p>
                    </div>
                    <span className="font-semibold text-app-green">
                      {currency}{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon inputs */}
              <div className="border-t border-app-border pt-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-orange-50 text-app-orange border border-app-orange/20 rounded-xl px-3 py-2.5 text-xs">
                    <span className="flex items-center gap-1 font-semibold">
                      <TicketIcon className="size-4" /> {appliedCoupon} APPLIED
                    </span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs font-semibold underline hover:text-app-orange-dark"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code (NURA20, FREESHIP)"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-app-cream rounded-xl border border-app-border focus:border-app-green focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-app-green text-white text-xs font-semibold rounded-xl hover:bg-app-green-light"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-app-border pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-app-text-light">
                  <span>Subtotal</span>
                  <span className="font-medium text-app-green">{currency}{cartTotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-app-orange">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-{currency}{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-app-text-light">
                  <span>Delivery Fee</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-app-success font-semibold">Free</span>
                    ) : (
                      `${currency}${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-app-text-light">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-medium text-app-green">{currency}{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-app-border pt-3">
                  <span className="text-app-green">Total</span>
                  <span className="text-app-green">{currency}{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full mt-2 py-3 bg-app-orange text-white font-semibold rounded-xl hover:bg-app-orange-dark transition-colors flex-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs text-sm"
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
                <ArrowRightIcon className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
