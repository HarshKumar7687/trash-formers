Trash-formers ♻️
Trash-formers is a smart waste management platform built using the MERN stack, Socket.io, Framer Motion, Tailwind CSS, and more. It combines technology, gamification, and community engagement to transform the way we manage waste for a more sustainable future.

🌟 Features
🏠 Home Page: Interactive landing page with an AI-powered chatbot for effortless navigation.

📊 Dashboard: Personalized user dashboard showing:

Eco-coins earned

Waste reports submitted

Total contests participated in

User rank based on contributions

Badges earned

📸 Waste Uploads: Upload waste images, detected by an ML model with real-time GPS location tagging.

🌐 Learning Hub: 3D interactive globe created with Three.js providing waste management tips.

🏆 Weekly Contests: A community-driven space to share innovative waste solutions. Users post ideas, vote, and appear on the leaderboard. Winners are rewarded with eco-coins.

🛍️ Eco Shop: Buy & sell “best out of waste” products using eco-coins or real money.

🛠️ Admin Panel: Complete management panel for monitoring and moderation.

🚀 Tech Stack
Frontend: React.js, Tailwind CSS, Framer Motion, Three.js, ScrollTrigger

Backend: Node.js, Express.js, Socket.io

Database: MongoDB

Other Integrations: ML model (for waste detection), GPS tracking, CDN

📫 Installation & Setup
Clone this repository

bash
git clone https://github.com/HarshKumar7687/trash-formers.git
cd trash-formers
Install dependencies for both backend and frontend

bash
# For backend
cd server
npm install

# For frontend
cd ../client
npm install
Create a .env file in the server folder with the following variables:

text
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
Start the development servers

bash
# Backend
cd server
npm start

# Frontend
cd client
npm start
🌍 Live Demo
Website: https://trash-former.netlify.app/

GitHub Repo: https://github.com/HarshKumar7687/trash-formers

👨‍💻 Team
Harsh Kumar

Shubham Sharma

Aakash Kumar

Ansh Chauhan

Laxmi Mishra

Shiva Shukla

📌 Future Enhancements
Mobile app integration

AI recommendations for waste reduction

AR-based waste sorting tutorials

Blockchain-based eco-coin system
