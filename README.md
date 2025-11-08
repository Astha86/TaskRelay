# 🚀 TaskRelay

A **microservices-based Task Management Backend** built with **Node.js**, **MongoDB**, **RabbitMQ**, and **Docker Compose**.

TaskRelay is designed as a distributed system where each service (User, Task, and Notification) operates independently but communicates asynchronously through **RabbitMQ message queues** — making it scalable, maintainable, and production-ready for future extensions.

---

## 🧩 Architecture Overview

**Services included:**
| Service | Description |
|----------|-------------|
| 🧑‍💼 **User Service** | Handles user data and basic operations |
| 🗂️ **Task Service** | Manages task creation, and publishing events to RabbitMQ |
| 🔔 **Notification Service** | Listens to task-related messages and triggers notifications |

Additional components:
- 🐇 **RabbitMQ** → For message queuing and async communication  
- 🍃 **MongoDB** → For persistent data storage  

---

## ⚙️ Tech Stack

- **Node.js** + **Express.js** — REST APIs for microservices  
- **MongoDB** — NoSQL database for storing users and tasks  
- **RabbitMQ** — Message broker for inter-service communication  
- **Docker** & **Docker Compose** — For containerization and orchestration  

---

## 🧠 How It Works

1. The **Task Service** creates a new task and publishes a message to RabbitMQ.  
2. The **Notification Service** consumes that message from the queue and processes it (for now, logs it; can be extended to send emails/alerts).  
3. The **User Service** can interact independently for user management.  
4. All services share the same MongoDB instance and communicate via queues.  

---

## 🐳 Run with Docker Compose

Make sure you have **Docker** and **Docker Compose v2** installed.

```bash
# Clone the repository
git clone https://github.com/Astha86/TaskRelay.git
cd TaskRelay

# Build and start all services
docker-compose up --build -d
