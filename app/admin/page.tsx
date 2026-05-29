"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Boxes, ClipboardList, LogIn, LogOut } from "lucide-react";
import { loginAdmin } from "@/lib/api";
import { clearAdminSession, getAdminSession, setAdminSession } from "@/lib/storage";
import { UserSession } from "@/lib/types";

export default function AdminPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [email, setEmail] = useState("admin@shop.com");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSession(getAdminSession());
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Signing in...");
    try {
      const user = await loginAdmin(email, password);
      setAdminSession(user);
      setSession(user);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign in.");
    }
  }

  function logout() {
    clearAdminSession();
    setSession(null);
  }

  return (
    <main>
      <section className="py-5 bg-white border-bottom">
        <div className="container-xl">
          <p className="eyebrow mb-2">MAK-Z back office</p>
          <h1 className="section-title mb-3">Admin</h1>
          <p className="text-muted mb-0">Manage the storefront, inventory, discounts, and checkout orders.</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-xl">
          {session ? (
            <section className="panel p-3 p-md-4">
              <h2 className="h3 fw-black mb-3">Welcome, {session.displayName}</h2>
              <div className="row g-3">
                <div className="col-md-6">
                  <Link className="btn btn-dark btn-lg w-100 d-inline-flex align-items-center justify-content-center gap-2" href="/admin/products">
                    <Boxes size={18} />
                    Manage products
                  </Link>
                </div>
                <div className="col-md-4">
                  <Link className="btn btn-outline-dark btn-lg w-100 d-inline-flex align-items-center justify-content-center gap-2" href="/admin/orders">
                    <ClipboardList size={18} />
                    Orders
                  </Link>
                </div>
                <div className="col-md-2">
                  <button className="btn btn-outline-danger btn-lg w-100 d-inline-flex align-items-center justify-content-center gap-2" onClick={logout}>
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <section className="panel p-3 p-md-4 mx-auto" style={{ maxWidth: 560 }}>
              <h2 className="h3 fw-black mb-3">Admin Login</h2>
              <form className="d-grid gap-3" onSubmit={submit}>
                <div>
                  <label className="form-label small text-muted fw-bold">Email</label>
                  <input className="form-control form-control-lg" type="email" value={email} onChange={event => setEmail(event.target.value)} required />
                </div>
                <div>
                  <label className="form-label small text-muted fw-bold">Password</label>
                  <input className="form-control form-control-lg" type="password" value={password} onChange={event => setPassword(event.target.value)} required />
                </div>
                <button className="btn btn-dark btn-lg d-inline-flex align-items-center justify-content-center gap-2" type="submit">
                  <LogIn size={18} />
                  Login
                </button>
                <p className="message mb-0">{message}</p>
              </form>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
