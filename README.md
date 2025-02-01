# Project Overview

##### This Node.js application is a monolithic architecture designed with extensibility and maintainability in mind. It uses TypeScript for strong typing and integrates several key technologies such as ExpressJS, PostgreSQL, Redis, REST API, clustering, and worker threads to ensure optimal performance. The application also applies multiple design patterns and software engineering principles to promote clean, maintainable, and testable code.

---

# 📖 Table of Contents

1. Features
2. Architecture Overview
3. Interaction Flow in DDD and Architecture
4. Domain-Driven Design Principles and Patterns
5. Design Patterns
6. Principles
7. Technologies
8. Getting Started
9. Project Structure
10. API Documentation
11. Running the Application
12. Running Tests (TODO list)
13. Usage
14. Contributing
15. License

---

# ✨ Features

## Order Management

* Order Retrieval
* Fetches a paginated list of orders with filtering options.
* Uses Redis caching to optimize data retrieval.
* Creates a new order with PENDING status.
* Associates the order with the current authenticated user.
* Publishes an event to notify admins about the new order.
* Future enhancement: Email notification to admins for approval.
* Updates order status from PENDING to COMPLETED.
* Generates an invoice and marks it as PAID.
* Publishes an event upon approval.
* Future enhancement: Email notification with an attached invoice.
* Updates order status from PENDING to CANCELLED.
* Generates an invoice and marks it as CANCELLED.
* Publishes an event upon cancellation.
* Future enhancement: Email notification with an attached invoice.

---

## User Service
* Fetches a paginated list of users with filtering options.
* Retrieves users along with their assigned roles.
* Uses Redis caching for performance optimization.
* Fetches a user by ID.
* Ensures the user exists before returning the data.
* Validates that an email is unique before creating a user.
* Assigns a default role if none is specified.
* Generates a strong password.
* Publishes an event upon user creation.
* Future enhancement: Send an email with login credentials.
* Updates user details, ensuring no duplicate email exists.
* Publishes an event upon user update.
* Verifies current password before allowing an update.
* Ensures password confirmation matches.
* Encrypts the new password before saving.
* Publishes an event upon password update.

---

## Future Enhancements

* Implement email notifications for order approvals, cancellations, and user account creation.
* Enhance Redis caching to improve query performance further.
* Introduce logging and monitoring to track system performance and user interactions.

---

# 🏗 Architecture Overview

#### This Node.js application follows a monolithic architecture that is modular and scalable. It uses the principles of Domain-Driven Design (DDD) to ensure that the codebase is well-organized and follows the business domain logic.

* Monolithic: While designed as a monolithic application, it’s built with an architecture that supports easy splitting into microservices should the need arise.
* Modular: The application is divided into clear modules like orders, users, invoices, etc., each with its own responsibility. This makes it easy to extend the system with new features.
* Layered Architecture: It follows a typical layered architecture pattern, separating concerns into layers such as the API layer (controllers), service layer, data access layer (repositories), and domain layer (models).
* Asynchronous Processing: Worker threads and Redis are used for asynchronous processing, ensuring that long-running tasks (like email notifications) don’t block the main application flow.
* Event-Driven: The application utilizes RabbitMQ to handle domain events (e.g., order updates, user creation) asynchronously, enabling decoupled communication between components.

---

# 🧩🔄⚙️🌐 Interaction Flow in DDD and Architecture

## 1. Domain Layer:

* The core domain logic is housed here, where entities like Order, User, and Invoice live. They represent the key concepts in the business domain.
* Operations like changing an order status or creating a user are encapsulated within these entities.

## 2. Application Layer:

* Services such as OrderService and UserService interact with domain entities to perform operations. They use repositories for data persistence.
* This layer uses patterns like Command and Observer to handle business logic and notify the system of changes (e.g., notifying the admins when an order is created).

## 3. Infrastructure Layer:

* Handles the technical details such as PostgreSQL, Redis, RabbitMQ, and email notifications.
* Redis is used to cache frequently accessed data, reducing load on the database.
* Worker threads handle tasks asynchronously, such as background processing for email notifications or batch updates.

## 4. API Layer:

* Exposes REST API endpoints to clients, interacting with the application layer to perform the required business logic.
* Uses ExpressJS and Swagger for routing and API documentation.

## 5. Event-Driven Communication:

* When a significant change occurs (like order approval or user creation), events are published to RabbitMQ to inform other systems or services.

---

# ⚙️ Domain-Driven Design Principles and Patterns

* REST API with ExpressJS & TypeScript
* PostgreSQL with ORM for database management
* Worker Threads to handle async processing
* Redis for caching and queue management
* Dependency Injection using typedi
* Microservices-ready architecture
* Event-driven system with RabbitMQ
* Robust Logging & Monitoring
* Unit & E2E Testing for reliability
* Security Best Practices
* Scalable & Maintainable Codebase
* Clustering for load balancing and high availability
* Domain-Driven Design Principles and Patterns

---

# 🧩⚙️🛠️📐 Design Patterns

##### The following design patterns have been applied to the system to ensure modularity, flexibility, and scalability:

## 1. Singleton Pattern

* Used for: Managing the database connection and the Redis cache manager.
* Why: Ensures that only one instance of the database connection or Redis client is created throughout the application, reducing the overhead and promoting reuse.

## 2. Factory Pattern

* Used for: Creating various service instances based on the application’s configuration.
* Why: Simplifies object creation and reduces tight coupling between components. Used for creating different database service objects or models.

## 3. Dependency Injection (DI)

* Used for: Injecting dependencies like services, repositories, and controllers into other components, e.g., through the TypeDI library.
* Why: Decouples the components and ensures that each class only knows about the abstractions, not the specific implementations. This makes testing and maintaining the codebase easier.

## 4. Observer Pattern

* Used for: Managing state changes and broadcasting changes to subscribers. This is used in parts of the application that require real-time updates, such as pushing notifications or WebSocket-based messages.
* Why: Provides an efficient way to notify parts of the application that need to act based on state changes.

## 5. Strategy Pattern

* Used for: Implementing different querying strategies (e.g., different REST API response structures).
* Why: Allows switching between different query response strategies without changing the core logic of the application.

## 6. Command Pattern

* Used for: Handling complex workflows or commands like submitting a job to Redis or performing CRUD operations in a transactional manner.
* Why: Encapsulates requests as objects, allowing parameterization and decoupling of command execution from the client.

## 7. Decorator Pattern

* Used for: Enhancing the functionality of services and controllers dynamically.
* Why: Allows adding new behavior (e.g., logging, error handling) without modifying existing code, promoting a clean and extendable design.

## 8. Proxy Pattern

* Used for: Implementing caching and rate-limiting mechanisms in front of certain APIs.
* Why: Helps optimize system performance by controlling access to external services, ensuring that expensive operations are cached or rate-limited.

## 9. Repository Pattern

* Used for: Abstracting the data access layer to provide a more manageable and flexible way to interact with the database.
* Why: Helps decouple database logic from business logic, making it easier to change or optimize data access strategies without impacting the rest of the application.

## 10. Builder Pattern

* Used for: Constructing complex objects like invoices, user profiles, and report generation in a systematic way.
* Why: Provides a flexible solution for constructing complex objects step by step, avoiding constructor overloading or complex factory methods.

## 11. Publisher-Subscriber Pattern

* Used for: Domain events trigger integration events that are published to RabbitMQ.
* Why: Enables asynchronous communication between components through event publishing and handling.

---

# 📏🧭💡⚖️ Principles

##### This project follows key software design principles to ensure a robust and maintainable codebase:

## 1. SOLID Principles

* Single Responsibility Principle (SRP): Each class and module has a single responsibility, minimizing changes and complexity.
* Open/Closed Principle (OCP): Classes and modules are open for extension but closed for modification, enabling easier feature additions without breaking existing functionality.
* Liskov Substitution Principle (LSP): Derived classes can be used in place of their base classes without altering the correctness of the program.
* Interface Segregation Principle (ISP): Clients should not be forced to depend on interfaces they do not use. This helps in creating smaller, specialized interfaces.
* Dependency Inversion Principle (DIP): High-level modules should not depend on low-level modules. Both should depend on abstractions, which is achieved through DI.

## 2. DRY (Don't Repeat Yourself)

* The codebase ensures that redundant logic and code are minimized. Reusable components and functions are created for common tasks such as error handling, logging, and validation.

## 3. KISS (Keep It Simple, Stupid)

* The application follows a simple and clear architecture, avoiding unnecessary complexity in both the design and implementation. We favor simplicity and readability.

## 4. YAGNI (You Aren't Gonna Need It)

* Only essential features and functionality are implemented. The project avoids overengineering, focusing on the current requirements.

## 5. Separation of Concerns

* The project ensures that business logic, data access, and presentation are separated. Each module is responsible for a specific concern, promoting modularity and maintainability.

## 6. Composition Over Inheritance

* The project favors composing objects and reusing behavior through composition rather than relying heavily on inheritance.

---

# 💻 Technologies

* Node.js: JavaScript runtime for building scalable network applications.
* ExpressJS: Web framework for Node.js to simplify route handling and middleware management.
* TypeScript: Superset of JavaScript that adds strong typing and compile-time checks.
* PostgreSQL: Relational database for structured data storage.
* Redis: In-memory data structure store for caching and job queue management.
* Clustering & Worker Threads: Used together for concurrency management, ensuring that the app efficiently utilizes multi-core processors without blocking the main thread.
* TypeDI: Dependency injection library to manage dependencies in a clean and scalable way.
* Swagger: API documentation tool for generating RESTful API documentation.
* Postman Collection: A Postman collection file is included in the project for API testing and use case validation.

---

# 🚀 Getting Started

## 1. Prerequisites

### For Docker Usage

* Install Docker Desktop and ensure it is running.

### For Application Usage

* Node.js (v23.x or higher)
* TypeScript
* PostgreSQL
* Redis
* RabbitMQ
* yarn

---

## Installation

## 1. Clone the repository:

```javascript
git clone git@github.com:yavarguliyev/invoices-hub.git
```

## 2. Set Up Environment: Run existing docker-compose file to start RabbitMQ, Redis and Postgres SQL via the command:

```javascript
docker-compose up -d
```

## 3. Install dependencies:

```javascript
yarn add
```

## 4. Run Migrations:

##### Run migrations:

```javascript
yarn mup
```

##### Revert migrations:

```javascript
yarn migrations:revert
```

##### Copy the .env.example file to .env and fill in the appropriate values for your environment.

---

# 📂 Project Structure

```javascript
/migrations
├── /{{migrations_scripts}}.ts
/src
├── /controllers
│   ├── user.controller.ts
│   ├── order.controller.ts
│   └── ...
├── /services
│   ├── user.service.ts
│   ├── order.service.ts
│   └── ...
├── /entities
│   ├── users.model.ts
│   ├── orders.model.ts
│   └── ...
├── /repositories
│   ├── user.repository.ts
│   ├── order.repository.ts
│   └── ...
├── /middlewares
│   ├── error.middleware.ts
│   └── ...
├── data-source.ts
├── index.ts.ts
/tests
│   ├── 
└── README.md
```

---

# 📚📄📝💻 API Documentation

#### API documentation is available at:

```javascript
http://localhost:3000/api-docs/#/
```

#### Swagger is used for API documentation, allowing developers to explore and test endpoints easily.

#### A Postman collection file is also included for testing API use cases:

```javascript
/postman/invoice_hub.postman_collection.json
```

# 🚀▶️💻 Running the Application

##### To start the application:

```javascript
yarn start
```

# 🧪✅🔍 Running Tests

##### To run unit tests:

```javascript
yarn test
```

---

# 🛠 Usage

## Example Operations

### 1. Create an Order

#### Endpoint: POST {{URL}}/api/v1/orders

```javascript
{
    "totalAmount": 180.20
}
```

### 2. Approve the Order

#### Endpoint: PATCH {{URL}}/api/v1/orders/{{id}}approve

### 3. Cancel the Order

#### Endpoint: PATCH {{URL}}/api/v1/orders/{{id}}cancel

---

# 🤝 Contributing

1. Fork the repository.
2. Create a new branch (git checkout -b feature-name).
3. Commit your changes (git commit -am 'Add new feature').
4. Push to the branch (git push origin feature-name).
5. Create a new Pull Request.

---

# 📝 License

#### This project is licensed under the MIT License. See the [LICENSE](https://github.com/yavarguliyev/invoices-hub/blob/master/LICENSE) file for details.
