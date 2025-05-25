# E-commerce App

A full-stack e-commerce application built with Next.js, React, Tailwind CSS, and other modern technologies.

## Features

-   Product listings and details
-   Shopping cart functionality
-   User authentication
-   Admin dashboard for product management

## Technologies Used

-   Next.js
-   React
-   Tailwind CSS
-   Zod
-   Lucide React
-   Sonner
-   Next-cloudinary
-   Axios

## Getting Started

1.  Clone the repository:

    ```bash
    git clone <repository-url>
    ```

2.  Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  Configure environment variables:

    -   Create a `.env.local` file in the root directory.
    -   Add the necessary environment variables (e.g., database connection string, API keys).

4.  Run the development server:

    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

## Example `.env.local` file

```env
MONGODB_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```