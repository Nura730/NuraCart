import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Order } from "../types";
import { dummyDashboardOrdersData } from "../assets/assets";
import Loading from "../components/Loading";
import { ArrowLeftIcon, PhoneIcon } from "lucide-react";
import OrderOTP from "../components/OrderTracking/OrderOTP";
import LiveMap from "../components/OrderTracking/LiveMap";
import OrderTimeLine from "../components/OrderTracking/OrderTimeLine";

const OrderTracking = () => {
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    const savedOrders = localStorage.getItem("app_orders");
    const localOrders = savedOrders ? JSON.parse(savedOrders) : [];
    const allOrders = [...localOrders, ...dummyDashboardOrdersData];
    const found = allOrders.find((o) => o._id === id);
    if (!found) {
      navigate("/orders");
      return;
    }
    setOrder(found as any);
    setLoading(false);
  }, [id, navigate]);

  if (loading) return <Loading />;
  if (!order) return null;

  return (
    <div className="min-h-screen mb-20 bg-app-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/*Header*/}
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-2 text-sm text-app-text-light hover:text-app-green mb-6 transition-colors"
        >
          <ArrowLeftIcon className="size-4" /> Back to Orders
        </button>
        {/*Order id, date, status*/}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-app-green">
              Order #{order!._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-app-text-light mt-1">
              Placed on{" "}
              {new Date(order!.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <span
            className={`px-4 py-1.5 text-sm font-semibold rounded-full ${order.status === "Delivered" ? "bg-green-100 text-green-700" : order.status === "Cancelled" ? "bg-red-100 text-red-700 " : "bg-app-orange/10 text-app-orange"}`}
          >
            {order!.status}
          </span>
        </div>
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* left side - Time + map*/}
          <div className="lg:col-span-2 space-y-6">
            {/*OTP*/}
            <OrderOTP order={order} />
            {/*Live tracking*/}
            <LiveMap order={order} liveLocation={liveLocation} />
            {/*Progress timeline*/}
            <OrderTimeLine order={order} />
            {/*Delivery Person */}
            {order?.deliveryPartner &&
              order.status !== "Delivered" &&
              order.status !== "Cancelled" && (
                <div className="bg-white rounded-2xl p-5 flex items-center justify-between border border-app-border">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-full bg-app-green text-white flex items-center justify-center font-bold text-sm"><span>
                      {order.deliveryPartner.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-app-green">{order.deliveryPartner.name}</p>
                      <p className="text-xs text-app-text-light">Delivery Partner • {order.deliveryPartner.phone}</p>
                    </div>
                  </div>
                  <a href={`tel:${order.deliveryPartner.phone}`} className="p-2.5 bg-app-cream rounded-xl hover:bg-app-cream-dark transition-colors">
                    <PhoneIcon className="size-4 text-app-green" />
                  </a>
                </div>
              )}
          </div>
          {/*Order Details Sidebar*/}
          <div className="bg-white rounded-2xl p-6 border border-app-border space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-app-green mb-4">Order Items</h3>
              <div className="divide-y divide-app-border">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex gap-3 py-3 items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-12 rounded-lg object-cover border border-app-border"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-app-green truncate">{item.name}</h4>
                      <p className="text-xs text-app-text-light">
                        {item.quantity} x {currency}{item.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-app-green">
                      {currency}{(item.quantity * item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-app-border pt-4">
              <h4 className="text-sm font-semibold text-app-green mb-2">Delivery Address</h4>
              <div className="bg-app-cream rounded-xl p-3 text-xs text-app-text-light space-y-1">
                <p className="font-semibold text-app-green">{order.shippingAddress.label}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                </p>
              </div>
            </div>

            <div className="border-t border-app-border pt-4">
              <h4 className="text-sm font-semibold text-app-green mb-2">Payment Info</h4>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-app-text-light">Payment Method:</span>
                <span className="font-medium text-app-green capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-app-text-light">Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                    order.isPaid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {order.isPaid ? "Paid" : "Pending Payment"}
                </span>
              </div>
            </div>

            <div className="border-t border-app-border pt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-app-text-light">Subtotal</span>
                <span className="font-medium text-app-green">{currency}{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-app-text-light">Delivery Fee</span>
                <span className="font-medium text-app-green">
                  {order.deliveryFee === 0 ? (
                    <span className="text-app-success font-semibold">Free</span>
                  ) : (
                    `${currency}${order.deliveryFee.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-app-text-light">Estimated Tax (8%)</span>
                <span className="font-medium text-app-green">{currency}{order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-app-border pt-2">
                <span className="text-app-green">Total</span>
                <span className="text-app-green">{currency}{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
