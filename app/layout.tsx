import React from "react"
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/components/boty/cart-context'
import { WishlistProvider } from '@/components/boty/wishlist-context'
import { ProductsProvider } from '@/components/boty/products-store'
import { OrdersProvider } from '@/components/boty/orders-store'
import { CustomersProvider } from '@/components/boty/customers-store'
import { AccountProvider } from '@/components/boty/account-context'
import { ReviewsProvider } from '@/components/boty/reviews-store'
import { LeadsProvider } from '@/components/boty/leads-store'
import { VirtualShoppingProvider } from '@/components/boty/virtual-shopping-store'
import { WhatsAppButton } from '@/components/boty/whatsapp-button'
import { DiscountPopup } from '@/components/boty/discount-popup'
import './globals.css'

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600']
});

const playfairDisplay = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'Bindu Vastram — Premium Sarees, Handpicked Elegance',
  description: 'Tradition in every thread, elegance in every drape. Premium handpicked sarees, ethnic wear, and jewellery from Bindu Vastram.',
  keywords: ['sarees', 'ethnic wear', 'Indian fashion', 'jewellery', 'blouses', 'handbags', 'Bindu Vastram'],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#FBF3E7',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${dmSans.variable} ${playfairDisplay.variable} font-sans antialiased`}>
        <CartProvider>
          <WishlistProvider>
            <ProductsProvider>
              <OrdersProvider>
                <CustomersProvider>
                  <AccountProvider>
                    <ReviewsProvider>
                      <LeadsProvider>
                        <VirtualShoppingProvider>
                          {children}
                          <WhatsAppButton />
                          <DiscountPopup />
                        </VirtualShoppingProvider>
                      </LeadsProvider>
                    </ReviewsProvider>
                  </AccountProvider>
                </CustomersProvider>
              </OrdersProvider>
            </ProductsProvider>
          </WishlistProvider>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
