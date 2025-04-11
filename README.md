# DRT Store - E-commerce Platform

A modern e-commerce platform built with Next.js, TypeScript, Tailwind CSS, and integrations with Supabase for database storage and Cloudinary for media management.

## 🚀 Features

- 📱 Responsive design that works on all devices
- 🛒 Full-featured shopping cart with local storage persistence
- 🏬 Product catalog with category browsing and search
- 👤 User authentication with Supabase
- 💳 Secure checkout process
- 🖼️ Image management with Cloudinary
- 📊 Admin dashboard with sales analytics
- 🔍 Search functionality with filtering and sorting
- 💬 WhatsApp integration for direct communication

## 🔧 Technologies

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Media Storage**: Cloudinary
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Context API
- **Authentication**: Supabase Auth

## 🏁 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account
- Cloudinary account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/drt-store.git
cd drt-store
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Copy the `.env.example` file to `.env.local` and fill in your environment variables:

```bash
cp .env.example .env.local
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   ├── (landing-page)/       # Landing page routes
│   ├── cart/                 # Shopping cart page
│   ├── checkout/             # Checkout page
│   ├── products/             # Product listing and details
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── ui/                   # UI components (buttons, cards, etc.)
│   └── ...                   # Feature components
├── hooks/                    # Custom React hooks
├── lib/                      # Utility functions and libraries
│   ├── supabase.ts           # Supabase client
│   ├── cloudinary.ts         # Cloudinary utilities
│   └── utils.ts              # Helper functions
├── styles/                   # Global styles
└── types/                    # TypeScript type definitions
```

## 📝 Recent Fixes and Improvements

### Type Consistency

Fixed inconsistency between different type definitions across the project:

- Standardized `Product` type across the application
- Made sure `CartItem` type properties align with `Product` type
- Updated component props to use the standard types

### UI/UX Improvements

- Enhanced form validation in checkout process
- Added better error handling with clear user feedback
- Improved loading states for asynchronous operations

### Code Organization

- Added comprehensive type declarations
- Created utility functions for common operations
- Added better documentation with comments

## 🧩 API Structure

The API is organized by resource:

- `/api/products`: Product CRUD operations
- `/api/products/[id]`: Single product operations
- `/api/products/images`: Product image management
- `/api/orders`: Order management
- `/api/orders/[id]`: Single order operations
- `/api/search`: Product search with filtering
- `/api/admin/dashboard`: Admin dashboard analytics

## 📱 WhatsApp Integration

The application features direct WhatsApp integration for customer inquiries and order processing:

1. Product pages include a "Contact via WhatsApp" button
2. The checkout process provides an option to confirm orders via WhatsApp
3. Customer support is available through WhatsApp messaging

## 🔐 Authentication

Authentication is handled through Supabase Auth with the following features:

- Email/password authentication
- Social login (optional)
- JWT token handling
- Protected routes for user accounts and admin functions

## 💾 Database Schema

The database schema includes the following primary tables:

- `products`: Product information
- `product_images`: Images associated with products
- `orders`: Customer orders
- `order_items`: Individual items within orders
- `users`: User accounts and profiles
- `user_roles`: User role assignments for authorization

## 🖼️ Media Management

Media files are managed through Cloudinary:

- Product images are stored in Cloudinary with structured folders
- Image transformations are handled through Cloudinary's API
- Different image sizes are served based on device requirements
- Videos for product demonstrations can be uploaded and served

## 🚀 Deployment

This application can be deployed to:

1. **Vercel** (Recommended):

   ```bash
   vercel --prod
   ```

2. **Netlify**: Configure the build settings in the Netlify dashboard.

3. **Self-hosted**:
   ```bash
   npm run build
   npm run start
   ```

## 🧪 Testing

Run the test suite:

```bash
npm run test
# or
yarn test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.io/)
- [Cloudinary](https://cloudinary.com/)
- [Lucide Icons](https://lucide.dev/)

## 📱 Contact

For questions or feedback, please contact us through:

- WhatsApp: +62-817-575-3345
- Email: support@drtstore.id
- Website: https://drtstore.id
