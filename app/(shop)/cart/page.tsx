'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart'

export default function CartPage() {
  const { items, total, count, updateQty, removeItem } = useCart()
  const router = useRouter()

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-stone-50 px-4">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
          <ShoppingBag className="w-10 h-10 text-stone-300" />
        </div>
        <h1 className="font-playfair text-3xl font-black text-stone-900 mb-3">Your Cart is Empty</h1>
        <p className="text-stone-500 mb-8 max-w-sm text-center">Looks like you haven't added any products to your cart yet.</p>
        <Link href="/collections" className="bg-brand text-white font-bold px-8 py-3.5 rounded-xl hover:bg-brand-dark transition-colors">
          Start Shopping
        </Link>
      </div>
    )
  }

  const vat = parseFloat((total * 0.05).toFixed(2))
  const grandTotal = total + vat

  return (
    <div className="bg-stone-50 min-h-screen py-10 md:py-16">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <h1 className="font-playfair text-3xl md:text-4xl font-black text-stone-900 mb-2">Shopping Cart</h1>
        <p className="text-stone-500 mb-8">You have {count} item{count !== 1 ? 's' : ''} in your cart.</p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="flex-1 bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-4 border-b border-stone-100 p-6 text-xs font-bold tracking-widest text-stone-400 uppercase">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-1 text-center">Total</div>
            </div>
            
            <div className="divide-y divide-stone-100">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center">
                  <div className="col-span-6 flex items-center gap-4 w-full">
                    <button onClick={() => removeItem(item.id)} className="text-stone-300 hover:text-red-500 transition-colors p-2 hidden sm:block">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-stone-50 rounded-xl relative overflow-hidden shrink-0">
                      <Image src={item.img || 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=200&h=200&fit=crop&auto=format'} alt={item.name} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-brand uppercase tracking-widest mb-1">{item.brand}</div>
                      <Link href={`/products/${item.slug}`} className="font-semibold text-stone-900 hover:text-brand transition-colors text-sm md:text-base leading-snug line-clamp-2">{item.name}</Link>
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-stone-900 font-semibold w-full flex justify-between sm:justify-center items-center">
                    <span className="sm:hidden text-stone-400 text-xs">Price:</span>
                    AED {item.price.toLocaleString()}
                  </div>
                  
                  <div className="col-span-3 flex justify-between sm:justify-center items-center w-full">
                     <span className="sm:hidden text-stone-400 text-xs shrink-0 mr-4">Quantity:</span>
                     <div className="flex items-center gap-1 border border-stone-200 rounded-lg p-1 w-fit bg-stone-50">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-white hover:shadow-sm rounded transition-all">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-white hover:shadow-sm rounded transition-all">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-span-1 text-right sm:text-center font-bold text-stone-900 w-full flex justify-between sm:justify-center items-center">
                    <span className="sm:hidden text-stone-400 text-xs">Subtotal:</span>
                    AED {(item.price * item.quantity).toLocaleString()}
                  </div>
                  
                  <button onClick={() => removeItem(item.id)} className="w-full mt-2 text-sm text-red-500 py-2 border border-red-100 rounded-lg sm:hidden flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4" /> Remove Item
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 sm:p-8 sticky top-24">
              <h2 className="font-playfair text-xl font-black text-stone-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-stone-500 text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">AED {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-500 text-sm">
                  <span>VAT (5%)</span>
                  <span className="font-semibold text-stone-900">AED {vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-500 text-sm">
                  <span>Shipping</span>
                  <span className="font-semibold text-brand text-xs uppercase tracking-widest">Calculated in checkout</span>
                </div>
              </div>
              
              <div className="border-t border-stone-100 pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-stone-900">Total</span>
                  <div className="text-right">
                    <span className="font-playfair text-3xl md:text-3xl font-black text-stone-900 tracking-tight">AED {grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <button onClick={() => router.push('/checkout')} className="w-full bg-brand text-white font-bold py-4 rounded-xl hover:bg-brand-dark transition-colors flex items-center justify-center gap-2 group">
                Proceed to Checkout <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="mt-4 text-center">
                <Link href="/collections" className="text-sm font-medium text-stone-500 hover:text-brand transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
