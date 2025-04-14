# Ecommerce Backend Project

This is an ecommerce backend system developed using the Node.js framework and MongoDB for data storage. It is designed to handle key features such as security, inventory management, and order processing, inspired by platforms like Shopee.

## Features

- **Security**: 
  - Implemented HMAC-SHA (HSA) for data integrity and security.
  - Used API keys and refresh tokens for secure authentication.

- **Data Models**: 
  - Designed various collections in MongoDB to manage essential ecommerce data, including:
    - Shops
    - Products
    - Keys
    - Inventory
    - Orders
    - Carts

- **Stock Management**: 
  - Utilized Redis to simulate permission-based locks for managing concurrent requests to product stock.
  - Prevents over-ordering of items when inventory is insufficient, ensuring better stock control and optimized performance.

## Technologies Used

- **Node.js**: Backend framework for handling API requests.
- **MongoDB**: NoSQL database for storing and managing data.
- **Redis**: Used to simulate permission locks for effective stock management and to handle concurrent requests efficiently.

## Overview

This backend system aims to provide a reliable, scalable, and secure solution for ecommerce operations. It focuses on ensuring smooth and efficient handling of products, orders, inventory, and security for a seamless user experience.
## Folder Structure

Below is the folder structure of the project, showcasing how the files and modules are organized:
ecommerce-backend/ │ ├── auth/ │ ├── authUtils.js │ └── checkauth.js │ ├── configs/ │ └── config.js │ ├── controllers/ │ ├── access.controller.js │ ├── cart.controller.js │ ├── checkout.controller.js │ ├── discount.controller.js │ ├── inventory.controller.js │ └── product.controller.js │ ├── core/ │ ├── error.response.js │ └── success.response.js │ ├── dbs/ │ └── db.js │ ├── helps/ │ ├── asyncHandler.js │ └── checkconnect.js │ ├── models/ │ └── repositories/ │ ├── apiKey.model.js │ ├── cart.model.js │ ├── discount.model.js │ ├── inventory.model.js │ ├── keyToken.model.js │ ├── order.model.js │ └── product.model.js │ ├── routes/ │ ├── access/ │ ├── cart/ │ ├── checkout/ │ ├── discount/ │ ├── inventory/ │ ├── product/ │ ├── shop/ │ └── index.js │ ├── services/ │ ├── access.service.js │ ├── apiKey.service.js │ ├── cart.service.js │ ├── checkout.service.js │ ├── discount.service.js │ ├── inventory.service.js │ ├── keyToken.service.js │ ├── product.service.js │ ├── redis.service.js │ ├── redisPubSub.service.js │ └── Shop.service.js │ ├── utils/ │ ├── httpStatusCode.js │ ├── index.js │ ├── reasonPhrases.js │ └── statusCodes.js │ └── app.js
  
