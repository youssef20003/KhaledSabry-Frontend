"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminOrders } from "@/lib/api";
import { money } from "@/lib/format";
import { Order } from "@/lib/types";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getAdminOrders().then(setOrders).catch(error => setMessage(error.message));
  }, []);

  return (
    <main>
      <section className="py-5 bg-white border-bottom">
        <div className="container-xl d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
          <div>
            <p className="eyebrow mb-2">Orders</p>
            <h1 className="section-title mb-3">Customer Orders</h1>
            <p className="text-muted mb-0">Customer details come from checkout, not accounts.</p>
          </div>
          <Link className="btn btn-dark" href="/admin/products">
            Products
          </Link>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-xl">
          {message && <div className="empty mb-3">{message}</div>}

          <div className="d-grid gap-3">
            {orders.map(order => (
              <article className="panel p-3 p-md-4" key={order.id}>
                <div className="d-flex flex-column flex-md-row justify-content-between gap-3 border-bottom pb-3 mb-3">
                  <div>
                    <h2 className="h4 fw-black mb-1">{order.userEmail}</h2>
                    <p className="text-muted mb-0">
                      {order.phoneNumber} / {new Date(order.orderDate).toLocaleString()} / {order.orderState}
                    </p>
                  </div>
                  <strong className="fs-4">{money.format(order.total)}</strong>
                </div>
                <div className="d-flex flex-wrap gap-3 mb-3 text-muted fw-bold">
                  <span>Subtotal: {money.format(order.subtotal)}</span>
                  <span>Shipping: {money.format(order.shippingFee ?? 0)}</span>
                  <span>{order.deliveryMethod}</span>
                </div>
                <p className="text-muted">
                  {order.address.firstName} {order.address.lastName}, {order.address.street}, {order.address.city},{" "}
                  {order.address.country}
                </p>
                <div className="d-grid gap-2">
                  {order.items.map(item => (
                    <div className="d-flex justify-content-between gap-3 border rounded-4 p-3 bg-white" key={`${order.id}-${item.productName}-${item.color}-${item.size}`}>
                      <div>
                        <strong>{item.productName}</strong>
                        <p className="text-muted small mb-0">
                          {item.color} / {item.size} / Qty {item.quantity}
                        </p>
                      </div>
                      <span className="fw-bold">{money.format(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
            {orders.length === 0 && !message && <div className="empty">No orders yet.</div>}
          </div>
        </div>
      </section>
    </main>
  );
}
