"use client";
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast, Toaster } from 'sonner';

type ProductImage = {
  _id: string;
  url: string;
  alt: string;
  isMain: boolean;
};

type ProductSize = {
  _id: string;
  name: string;
  stock: number;
};

type Product = {
  _id: string;
  name: string;
  images: ProductImage[];
  discountedPrice: number;
  realPrice: number;
  discountPercentage: number;
  shortDescription: string;
  description: string;
  sizes: ProductSize[];
  isAvailable: boolean;
  category: string;
  createdAt: string;
};

type ErrorType = {
  message: string;
  code?: string;
  retry?: boolean;
};

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorType | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showConfirm, setShowConfirm] = useState<{ open: boolean, productId?: string, productName?: string }>({ open: false });
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/products');

      if (!res.ok) {
        // Handle different HTTP error status codes
        if (res.status === 401 || res.status === 403) {
          throw new Error('You are not authorized to view these products. Please log in with admin credentials.');
        } else if (res.status === 404) {
          throw new Error('Products endpoint not found. Please contact the development team.');
        } else if (res.status >= 500) {
          throw new Error('Server error occurred. Please try again later.');
        } else {
          throw new Error(`Failed to fetch products: HTTP ${res.status}`);
        }
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }

      setProducts(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError({
          message: err.message,
          code: err.name === 'TypeError' ? 'NETWORK_ERROR' : 'API_ERROR',
          retry: true
        });
      } else {
        setError({
          message: 'An unknown error occurred while fetching products',
          code: 'UNKNOWN_ERROR',
          retry: true
        });
      }
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  const handleDelete = async (productId: string) => {
    const response = await axios.post('/api/admin/deleteProduct', { productId });
    if (response.status === 200) {
      setProducts(products.filter(product => product._id !== productId));
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);

    setTimeout(() => {
      fetchProducts();
    }, 500); // Small delay to show the retry animation
  };

  const openConfirm = (productId: string, productName: string) => {
    setShowConfirm({ open: true, productId, productName });
    setTimeout(() => {
      confirmButtonRef.current?.focus();
    }, 100);
  };

  const closeConfirm = () => {
    setShowConfirm({ open: false })
  };

  const confirmDelete = async () => {
    if (showConfirm.productId) {
      await handleDelete(showConfirm.productId);
    }
    setShowConfirm({ open: false });
    toast.success('Product deleted successfully');
  };

  const renderErrorState = () => {
    return (
      <div style={{
        background: '#fef2f2',
        border: '1px solid #f87171',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        maxWidth: '600px',
        margin: '2rem auto',
        textAlign: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h3 style={{ color: '#b91c1c', fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Error Loading Products
        </h3>
        <p style={{ color: '#7f1d1d', marginBottom: '1rem' }}>{error?.message}</p>
        {error?.code && (
          <div style={{ background: '#fee2e2', padding: '0.5rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'inline-block' }}>
            <code style={{ color: '#991b1b', fontSize: '0.875rem' }}>Error Code: {error.code}</code>
          </div>
        )}
        {error?.retry && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            style={{
              background: isRetrying ? '#9ca3af' : '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.5rem 1rem',
              fontWeight: '600',
              cursor: isRetrying ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              transition: 'background 0.2s',
              position: 'relative',
              width: '120px',
              height: '40px'
            }}
            onMouseOver={e => !isRetrying && (e.currentTarget.style.background = '#b91c1c')}
            onMouseOut={e => !isRetrying && (e.currentTarget.style.background = '#ef4444')}
          >
            {isRetrying ? (
              <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '3px solid #f3f4f6', borderBottomColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
            ) : (
              'Try Again'
            )}
          </button>
        )}
      </div>
    );
  };

  const renderLoadingState = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}></div>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading products...</p>
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  };

  const renderEmptyState = () => {
    return (
      <div style={{
        background: '#f8fafc',
        border: '1px dashed #94a3b8',
        borderRadius: '0.75rem',
        padding: '2rem',
        textAlign: 'center',
        maxWidth: '500px',
        margin: '2rem auto'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
        <h3 style={{ color: '#475569', fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>No Products Found</h3>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>There are no products in the system yet.</p>
        <button
          style={{
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#4338ca')}
          onMouseOut={e => (e.currentTarget.style.background = '#6366f1')}
          onClick={() => router.push('/admin/dashboard/add-new-product')}
        >
          Add Your First Product
        </button>
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem', background: '#f1f5f9', minHeight: '100vh', color: '#1e293b' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#3730a3', fontWeight: 800, letterSpacing: '0.02em' }}>Admin: Your Products</h2>

      {loading && renderLoadingState()}
      {error && renderErrorState()}
      {!loading && !error && products.length === 0 && renderEmptyState()}

      {!loading && !error && products.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.2rem',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
        }}>
          {products.map((product) => (
            <div
              key={product._id}
              style={{
                width: '260px',
                minHeight: '390px',
                border: '1.5px solid #6366f1',
                borderRadius: '1rem',
                padding: '1.2rem',
                background: '#ffffff',
                boxShadow: '0 4px 16px rgba(99,102,241,0.07)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                transition: 'box-shadow 0.2s, transform 0.2s',
                margin: '0',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
              onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(99,102,241,0.13)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
              onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(99,102,241,0.07)'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
            >
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images.find((img) => img.isMain)?.url || product.images[0].url}
                  alt={product.images.find((img) => img.isMain)?.alt || product.name}
                  width={120}
                  height={120}
                  style={{ objectFit: 'cover', borderRadius: '0.7rem', marginBottom: '0.8rem', border: '2px solid #6366f1', background: '#f1f5f9' }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/120?text=No+Image';
                    e.currentTarget.style.border = '2px solid #ef4444';
                  }}
                />
              ) : (
                <div style={{
                  width: '120px',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0.7rem',
                  marginBottom: '0.8rem',
                  border: '2px solid #d1d5db',
                  background: '#f1f5f9',
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  padding: '0.5rem'
                }}>
                  No Image Available
                </div>
              )}
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem', textAlign: 'center', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{product.name || 'Unnamed Product'}</h3>
              <div style={{ marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '1rem' }}>₹{product.discountedPrice || 0}</span>
                <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '0.95rem' }}>₹{product.realPrice || 0}</span>
                <span style={{ color: '#ef4444', fontWeight: 500, fontSize: '0.95rem' }}>-{product.discountPercentage || 0}%</span>
              </div>
              <div style={{ marginBottom: '0.3rem', color: '#64748b', fontSize: '0.85rem', textAlign: 'center', minHeight: '36px', whiteSpace: 'pre-line', overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: '2.7em' }}>
                {product.shortDescription ?
                  (product.shortDescription.slice(0, 50) + (product.shortDescription.length > 50 ? '...' : '')) :
                  'No description available'
                }
              </div>
              <div style={{ marginBottom: '0.3rem', width: '100%' }}>
                <span style={{ fontWeight: 500, fontSize: '0.9rem', color: '#374151' }}>Sizes: </span>
                {product.sizes && product.sizes.length > 0 ? (
                  product.sizes.map((size) => (
                    <span key={size._id} style={{ border: '1px solid #d1d5db', borderRadius: '0.3rem', padding: '0.1rem 0.4rem', marginRight: '0.2rem', fontSize: '0.85rem', background: '#ffffff', color: '#374151', display: 'inline-block' }}>{size.name}</span>
                  ))
                ) : (
                  <span style={{ color: '#9ca3af' }}>N/A</span>
                )}
              </div>
              <div style={{
                color: product.isAvailable ? '#16a34a' : '#ef4444',
                fontWeight: 600,
                fontSize: '0.9rem',
                marginBottom: '0.3rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: product.isAvailable ? '#16a34a' : '#ef4444'
                }}></span>
                {product.isAvailable ? 'In Stock' : 'Out of Stock'}
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Category: {product.category || 'Uncategorized'}</div>
              <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.7rem' }}>
                Created: {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'Unknown date'}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', width: '100%', justifyContent: 'center' }}>
                <button
                  style={{ background: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '0.3rem', padding: '0.3rem 0.8rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', transition: 'background 0.15s' }}
                  onMouseOver={e => (e.currentTarget.style.background = '#4338ca')}
                  onMouseOut={e => (e.currentTarget.style.background = '#6366f1')}
                  onClick={() => router.push(`/admin/dashboard/update-product/${product._id}`)}
                >
                  Edit
                </button>
                <button
                  style={{ background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '0.3rem', padding: '0.3rem 0.8rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', transition: 'background 0.15s' }}
                  onMouseOver={e => (e.currentTarget.style.background = '#b91c1c')}
                  onMouseOut={e => (e.currentTarget.style.background = '#ef4444')}
                  onClick={() => openConfirm(product._id, product.name)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          <Toaster />
        </div>
      )}

      {showConfirm.open && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,41,59,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: '#ffffff', borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: '2.2rem 2.5rem', minWidth: 340, maxWidth: '90vw', textAlign: 'center', position: 'relative' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '0.7rem', color: '#ef4444' }}>⚠️</div>
            <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem', color: '#1e293b' }}>Delete Product?</h3>
            <p style={{ color: '#64748b', marginBottom: '1.2rem', fontSize: '1rem' }}>
              Are you sure you want to delete <span style={{ color: '#ef4444', fontWeight: 600 }}>&quot;{showConfirm.productName}&quot;</span>?<br />This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.2rem' }}>
              <button
                ref={confirmButtonRef}
                style={{ background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '0.4rem', padding: '0.5rem 1.2rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(239,68,68,0.08)', transition: 'background 0.15s' }}
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
              <button
                style={{ background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '0.4rem', padding: '0.5rem 1.2rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(100,116,139,0.07)', transition: 'background 0.15s' }}
                onClick={closeConfirm}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ProductsPage;