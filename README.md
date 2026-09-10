# Product Inventory System API

A backend inventory management system built with **Node.js**, **Express**, and **PostgreSQL**.

## 🚀 Features
- **RESTful APIs**: Create, Read (All & By ID), Update, and Delete products.
- **Business Logic**: Prevents negative quantities, validates price > 0, and returns low-stock warnings if quantity is less than 5.
- **Error Handling**: Handles duplicate SKU entries gracefully using PostgreSQL unique constraint checks.
- **Security & Performance**: Uses parameterized queries to prevent SQL injection, efficient column selection, and indexes on `sku` and `category` columns.
- **Activity Logging**: Console logging for all inventory creation, updates, and deletions.

## 🛠️ Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL, pgAdmin
- **Environment Management**: Dotenv

## 📌 API Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/products` | Create a new product |
| **GET** | `/api/products` | Retrieve all products |
| **GET** | `/api/products/:id` | Retrieve a product by ID |
| **PUT** | `/api/products/:id` | Update a product by ID |
| **DELETE**| `/api/products/:id` | Delete a product by ID |

## ⚙️ Setup & Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
