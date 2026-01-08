# Post-Purchase Notify

This app allows a merchant to configure a post-purchase message from an admin interface, and displays a message to customers after checkout using a Shopify Post-Purchase UI Extension.

### Project Overview

1.  **Full-stack Development:** Connecting a React Admin UI to a Node.js backend.
2.  **Shopify Architecture:** Leveraging Remix, Prisma, and GraphQL.
3.  **Extension Logic:** Rendering secure UI in the Post-Purchase sandbox.
4.  **Data Synchronization:** Syncing local database state with Shopify Metafields.

### Tech Stack & Architecture Decisions

**Original Requirement:** Node/Express/MongoDB.
**Actual Implementation:** Node/Remix/Prisma (SQLite).

#### Why this architecture?

I consciously chose the **Shopify CLI standard boilerplate (Remix)** over a custom Express/Mongo setup for the following strategic reasons:

- **Modern Standards:** Remix is the current standard for building embedded apps.
- **Stability:** Using the official boilerplate allowed me to focus on the core assignment logic (Extensions & Metafields) rather than debugging OAuth handshakes and database connections.
- **Prisma (SQLite):** For this dev assignment, SQLite was faster to setup, making app easier to run locally.

### Features

1.  **Admin Dashboard (Remix/React):**
    - Merchants can input a custom message (e.g., "Special Offer: Use code WELCOME20").
    - **Dual-Write Logic:** Data is saved to:
      1.  **Local Database (Prisma):** For app state management.
      2.  **Shopify Metafields:** Via GraphQL mutations (`namespace: custom`, `key: message`), making the data accessible to the checkout extensions.
2.  **Post-Purchase Extension:**
    - Intercepts the checkout flow post-payment.
    - Reads the configuration from `inputData`.
    - **Defensive Rendering:** Includes robust fallbacks to ensure the UI never breaks, even if data propagation is delayed.

### Post-Purchase Extension Implementation:

- Implemented using Checkout::PostPurchase::ShouldRender and Checkout::PostPurchase::Render

- The extension renders a confirmation message after checkout

- The extension was tested on a Shopify Plus-enabled development store, as required by Shopify for post-purchase flows

### Setup & Installation

**Steps:**

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    shopify run dev
    ```
4.  Install the app on Development Store.
5.  **Enable the Data:**
    - Go to the App Dashboard in Shopify Admin.
    - Enter a message and click **Save**.

### Key Assumptions & Troubleshooting

During development, I encountered and resolved specific environment challenges:

### 1. The "Dynamic Data" Sandbox Issue

**Challenge:**
Even after saving the Metafield, the Post-Purchase extension's `inputData` object would occasionally return an empty `metafields: []` array. After searching over internet I found out this is a known behavior due to checkout snapshots caching stale data.

**Solution:**
I implemented **defensive coding** in the extension logic (`extensions/post-purchase-message/src/index.jsx`):

```javascript
const metafields = inputData?.shop?.metafields || [];

if (Array.isArray(metafields)) {
  const found = metafields.find((m) => m.key === "message");
  message = found?.value || "Thank you for your order!";
}
```

> I tried to fetch the dynamic values as saved in admin which does saves in db but with metafields they are not accessible on checkout. I checked out scopes and permissions also but I was unable to figure out the issue or is it any issue with how the data is handled!

### Reference docs:

1. [Post Purchase Shopify Doc](https://shopify.dev/docs/api/checkout-extensions/post-purchase)
2. [Post Purchase Product Shopify Doc](https://shopify.dev/docs/apps/build/checkout/product-offers/build-a-post-purchase-offer)

#### Author: Shubham Singh

#### Purpose: Technical Evaluation Assignment - Clockwork
