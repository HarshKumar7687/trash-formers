# ♻️ TrashFormers

> A full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application that enables users to report waste, track cleanup requests, and promote sustainable waste management through a rewarding community-driven platform.

![GitHub](https://img.shields.io/badge/MERN-Full%20Stack-green)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248)

---

## 📖 Overview

TrashFormers is a modern waste management platform that allows users to report waste by uploading images, selecting waste categories, and sharing the location. Administrators can verify reports and manage cleanup requests, while users earn Eco Coins for verified submissions, encouraging community participation and environmental sustainability.

---

## ✨ Features

- 🔐 Secure User Authentication
- 👤 User Registration & Login
- 📸 Upload Multiple Waste Images
- 📍 Location-Based Waste Reporting
- 🗑️ Waste Category Selection
- 📊 User Dashboard
- 🛠️ Admin Dashboard
- 🏆 Eco Coin Reward System
- ✅ Report Verification
- 📱 Fully Responsive Design
- ⚡ Fast and Interactive React UI
- 🔒 Protected Routes
- 🌙 Clean Modern Interface

---

## 🛠 Tech Stack

### Frontend
- React.js
- React Router
- Axios
- Tailwind CSS
- JavaScript (ES6+)

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- JSON Web Token (JWT)
- bcrypt.js

### File Upload
- Multer

### Version Control
- Git
- GitHub

---

## 📂 Project Structure

```text
TrashFormers/
│
├── client/                        # React Frontend
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── netlify.toml
│
├── server/                        # Express Backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   └── render.yaml
│
├── ml/                            # AI Waste Classification Service
│   ├── app.py
│   ├── requirements.txt
│   ├── garbage_classification_cnn.h5
│   ├── waste_model.h5
│   ├── class_mapping.json
│   ├── class_names.pkl
│   ├── label_encoder.pkl
│   ├── model_config.pkl
│   └── biological18.jpg
│
├── README.md
└── .gitignore
```

---

## 🚀 Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/TrashFormers.git
```

```bash
cd TrashFormers
```

---

### Install Client Dependencies

```bash
cd client
npm install
```

---

### Install Server Dependencies

```bash
cd ../server
npm install
```

---

### Configure Environment Variables

Create a `.env` file inside the **server** directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

---

### Run the Backend

```bash
cd server
npm run dev
```

---

### Run the Frontend

```bash
cd client
npm run dev
```

---

### Run ml

If using concurrently:

```bash
cd ml
python app.py
```

---

## 📸 Screenshots

Include screenshots of:

- Home Page
- Login Page
- Register Page
- User Dashboard
- Waste Report Form
- Admin Dashboard
- Eco Coin Dashboard

Example:

```
screenshots/
├── home.png
├── login.png
├── register.png
├── dashboard.png
├── report.png
├── admin.png
```

---

## 🌍 Workflow

1. User creates an account.
2. User logs into the application.
3. User reports waste by:
   - Uploading images
   - Selecting waste category
   - Providing location
4. Report is stored in MongoDB.
5. Admin reviews and verifies the report.
6. Eco Coins are awarded after successful verification.
7. Users can monitor their reports through the dashboard.

---

## 🎯 Learning Outcomes

This project strengthened my understanding of:

- MERN Stack Development
- RESTful API Design
- React Component Architecture
- MongoDB Database Design
- JWT Authentication
- State Management
- CRUD Operations
- File Upload Handling
- Responsive UI Design
- API Integration
- Git & GitHub Workflow

---

## 🔮 Future Enhancements

- Google Maps Integration
- AI-based Waste Classification
- Real-Time Notifications
- Leaderboard
- Dark Mode
- Mobile Application
- QR Code Waste Collection
- Analytics Dashboard
- Email Notifications
- Report Status Tracking

---


## 👨‍💻 Author

**Harsh Kumar**

B.Tech Computer Science Engineering  
Institute of Technical Education and Research (ITER), SOA University

### Connect with Me

- 💼 LinkedIn: https://www.linkedin.com/in/harsh-kumar-91aa8132b/
- 💻 GitHub: https://github.com/HarshKumar7687
- 🌐 Portfolio: https://harshkumar-dev-portfolio.netlify.app/

---

## ⭐ Support

If you found this project helpful, please consider giving it a **⭐ Star** on GitHub.

Your support motivates further development and improvements.
