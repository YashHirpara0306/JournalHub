
---

# 📓 JournalHub – Secure Journal Entry Management App

**Tech Stack:** Spring Boot | MongoDB Atlas | Spring Security | Thymeleaf | HTML/CSS | Maven

JournalHub is a full-stack web application designed for managing personal or professional journal entries securely. It features a clean and responsive UI, user authentication, and complete CRUD operations for journal entries.

## 🔧 Features

* ✅ **Spring Boot backend** for efficient RESTful API development.
* 💾 **MongoDB Atlas integration** for cloud-based NoSQL storage.
* 🔐 **User Authentication & Role-Based Access Control (RBAC)** using Spring Security with BCrypt password hashing.
* 🔄 **Full CRUD functionality**: Create, Read, Update, and Delete journal entries.
* 🌐 **Cross-Origin Resource Sharing (CORS)** configuration for secure API usage across domains.
* 💡 **Custom login & session management** with error handling and secure password policies.
* 🎨 **Frontend UI** built with Thymeleaf templates, enhanced with HTML and CSS for responsiveness.
* 🧱 **Modular project structure**, detailed logging, and exception handling for scalability and maintainability.

## 📁 Structure

```
JournalHub/
├── src/
│   ├── main/
│   │   ├── java/       // Spring Boot codebase
│   │   ├── resources/  // Thymeleaf templates, static files
├── pom.xml             // Maven dependencies
├── README.md
```

## 🚀 Getting Started

1. Clone the repo:

   ```bash
   git clone https://github.com/your-username/JournalHub.git
   ```
2. Configure MongoDB Atlas URI in `application.properties`.
3. Run the application using your IDE or:

   ```bash
   mvn spring-boot:run
   ```
4. Access the app at `http://localhost:8080`

## 📌 Notes

* Default roles: `USER`, `ADMIN`
* Passwords are encrypted using BCrypt
* Designed to be easily extensible for additional modules (e.g., analytics, tags)

---

