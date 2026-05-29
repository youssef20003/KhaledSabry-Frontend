"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw, Save, Tag, Trash2, Upload } from "lucide-react";
import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  getBrands,
  getTypes,
  setProductDiscount,
  updateProduct
} from "@/lib/api";
import { joinList, money, splitList } from "@/lib/format";
import { CatalogOption, Product, ProductUpsert } from "@/lib/types";

const blankProduct: ProductUpsert = {
  name: "",
  description: "",
  pictureUrl: "",
  imageUrls: [],
  price: 0,
  discountPercentage: 0,
  colors: [],
  sizes: [],
  material: "Cotton",
  gender: "Unisex",
  stockQuantity: 0,
  isFeatured: false,
  isActive: true,
  brandId: 1,
  typeId: 1
};

export default function AdminProductsPage() {
  const formPanelRef = useRef<HTMLElement | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<CatalogOption[]>([]);
  const [types, setTypes] = useState<CatalogOption[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(blankProduct);
  const [colorText, setColorText] = useState("");
  const [sizeText, setSizeText] = useState("");
  const [imageText, setImageText] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const params = new URLSearchParams({ pageIndex: "1", pageSize: "24", includeInactive: "true" });
    const [productResult, brandResult, typeResult] = await Promise.all([getAdminProducts(params), getBrands(), getTypes()]);
    setProducts(productResult.data);
    setBrands(brandResult);
    setTypes(typeResult);
  }

  useEffect(() => {
    load().catch(error => setMessage(error.message));
  }, []);

  function edit(product: Product) {
    setEditingId(product.id);
    const next = {
      name: product.name,
      description: product.description,
      pictureUrl: product.pictureUrl,
      imageUrls: product.imageUrls,
      price: product.price,
      discountPercentage: product.discountPercentage,
      colors: product.colors,
      sizes: product.sizes,
      material: product.material,
      gender: product.gender,
      stockQuantity: product.stockQuantity,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      brandId: product.brandId,
      typeId: product.typeId
    };
    setForm(next);
    setColorText(joinList(next.colors));
    setSizeText(joinList(next.sizes));
    setImageText(joinList(next.imageUrls.filter(url => url !== next.pictureUrl && !url.startsWith("data:"))));
    window.setTimeout(() => formPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function reset() {
    setEditingId(null);
    setForm({ ...blankProduct });
    setColorText("");
    setSizeText("");
    setImageText("");
  }

  function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Choose an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      setForm(current => ({ ...current, pictureUrl: dataUrl }));
      setMessage("Image loaded from your PC.");
    };
    reader.onerror = () => setMessage("Could not read that image.");
    reader.readAsDataURL(file);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      ...form,
      colors: splitList(colorText),
      sizes: splitList(sizeText),
      imageUrls: splitList(imageText)
    };

    setMessage("Saving...");
    try {
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      reset();
      await load();
      setMessage("Product saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save product.");
    }
  }

  async function discount(product: Product) {
    const raw = window.prompt("Discount percentage", String(product.discountPercentage));
    if (raw === null) return;
    await setProductDiscount(product.id, Number(raw));
    await load();
  }

  async function remove(product: Product) {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    await deleteProduct(product.id);
    await load();
  }

  return (
    <main>
      <section className="py-5 bg-white border-bottom">
        <div className="container-xl d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
          <div>
            <p className="eyebrow mb-2">Inventory</p>
            <h1 className="section-title mb-3">Admin Products</h1>
            <p className="text-muted mb-0">Create products, upload image URLs, define colors and sizes, and apply discounts.</p>
          </div>
          <div className="d-flex gap-2">
            <Link className="btn btn-outline-dark" href="/admin">Admin home</Link>
            <Link className="btn btn-dark" href="/admin/orders">Orders</Link>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-xl">
          <section className="panel p-3 p-md-4 mb-4" ref={formPanelRef}>
            <h2 className="h3 fw-black mb-3">{editingId ? "Edit Product" : "Add Product"}</h2>
            <form className="d-grid gap-3" onSubmit={submit}>
              <div className="row g-3">
                <div className="col-md-6 col-xl-3">
                  <label className="form-label small text-muted fw-bold">Name</label>
                  <input className="form-control" required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} />
                </div>
                <div className="col-md-6 col-xl-3">
                  <label className="form-label small text-muted fw-bold">Price</label>
                  <input className="form-control" required type="number" value={form.price} onChange={event => setForm({ ...form, price: Number(event.target.value) })} />
                </div>
                <div className="col-md-6 col-xl-3">
                  <label className="form-label small text-muted fw-bold">Discount %</label>
                  <input className="form-control" type="number" min="0" max="100" value={form.discountPercentage} onChange={event => setForm({ ...form, discountPercentage: Number(event.target.value) })} />
                </div>
                <div className="col-md-6 col-xl-3">
                  <label className="form-label small text-muted fw-bold">Stock</label>
                  <input className="form-control" type="number" value={form.stockQuantity} onChange={event => setForm({ ...form, stockQuantity: Number(event.target.value) })} />
                </div>
                <div className="col-md-6 col-xl-3">
                  <label className="form-label small text-muted fw-bold">Brand</label>
                  <select className="form-select" value={form.brandId} onChange={event => setForm({ ...form, brandId: Number(event.target.value) })}>
                    {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                  </select>
                </div>
                <div className="col-md-6 col-xl-3">
                  <label className="form-label small text-muted fw-bold">Type</label>
                  <select className="form-select" value={form.typeId} onChange={event => setForm({ ...form, typeId: Number(event.target.value) })}>
                    {types.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                  </select>
                </div>
                <div className="col-md-6 col-xl-3">
                  <label className="form-label small text-muted fw-bold">Material</label>
                  <input className="form-control" value={form.material} onChange={event => setForm({ ...form, material: event.target.value })} />
                </div>
                <div className="col-md-6 col-xl-3">
                  <label className="form-label small text-muted fw-bold">Gender</label>
                  <input className="form-control" value={form.gender} onChange={event => setForm({ ...form, gender: event.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-muted fw-bold">Colors</label>
                  <input className="form-control" required value={colorText} onChange={event => setColorText(event.target.value)} placeholder="White, Navy" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-muted fw-bold">Sizes</label>
                  <input className="form-control" required value={sizeText} onChange={event => setSizeText(event.target.value)} placeholder="S, M, L" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-muted fw-bold">Main image URL</label>
                  <input className="form-control" required value={form.pictureUrl} onChange={event => setForm({ ...form, pictureUrl: event.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-muted fw-bold">Gallery image URLs</label>
                  <input className="form-control" value={imageText} onChange={event => setImageText(event.target.value)} placeholder="url1, url2" />
                </div>
              </div>

              <div className="d-flex flex-wrap gap-3 align-items-center">
                <label className="btn btn-outline-dark file-picker mb-0 d-inline-flex align-items-center gap-2">
                  <Upload size={16} />
                  Upload main image from PC
                  <input accept="image/*" type="file" onChange={uploadImage} />
                </label>
                {form.pictureUrl && <img className="admin-preview" src={form.pictureUrl} alt="Selected product preview" />}
              </div>

              <div>
                <label className="form-label small text-muted fw-bold">Description</label>
                <textarea className="form-control" required rows={4} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} />
              </div>

              <div className="d-flex flex-wrap gap-3">
                <label className="form-check-label d-flex align-items-center gap-2 fw-bold">
                  <input className="form-check-input m-0" type="checkbox" checked={form.isFeatured} onChange={event => setForm({ ...form, isFeatured: event.target.checked })} />
                  Featured
                </label>
                <label className="form-check-label d-flex align-items-center gap-2 fw-bold">
                  <input className="form-check-input m-0" type="checkbox" checked={form.isActive} onChange={event => setForm({ ...form, isActive: event.target.checked })} />
                  Active
                </label>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-dark d-inline-flex align-items-center gap-2" type="submit">
                  {editingId ? <Save size={16} /> : <Plus size={16} />}
                  {editingId ? "Save changes" : "Create product"}
                </button>
                <button className="btn btn-outline-dark d-inline-flex align-items-center gap-2" type="button" onClick={reset}>
                  <RefreshCw size={16} />
                  Reset
                </button>
              </div>
              <p className="message mb-0">{message}</p>
            </form>
          </section>

          <section className="d-grid gap-3">
            {products.map(product => (
              <article className="panel p-3" key={product.id}>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <div>
                    <h3 className="h5 fw-black mb-1">{product.name}</h3>
                    <p className="text-muted mb-0">
                      {product.colors.join(", ")} / {product.sizes.join(", ")} / {money.format(product.priceAfterDiscount)}
                    </p>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <button className="btn btn-outline-dark d-inline-flex align-items-center gap-2" onClick={() => edit(product)}>
                      <Save size={16} />
                      Edit
                    </button>
                    <button className="btn btn-outline-dark d-inline-flex align-items-center gap-2" onClick={() => discount(product)}>
                      <Tag size={16} />
                      Discount
                    </button>
                    <button className="btn btn-outline-danger d-inline-flex align-items-center gap-2" onClick={() => remove(product)}>
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}
