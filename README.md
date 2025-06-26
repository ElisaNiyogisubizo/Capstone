# The Sundays Art Hub Digital Platform

A comprehensive digital marketplace connecting local artists with art enthusiasts and collectors. Built with React, Node.js, TypeScript, and MongoDB.

## 🎨 Features

### For Artists
- **Artist Registration & Profiles**: Create detailed profiles with bio, specializations, and portfolio
- **Artwork Management**: Upload, edit, and manage artwork listings with multiple images
- **Sales Dashboard**: Track views, likes, sales, and revenue
- **Direct Communication**: Message system with potential buyers
- **Portfolio Showcase**: Professional artist profiles with social media integration

### For Community/Buyers
- **Browse & Discover**: Explore artworks by category, price, artist, and more
- **Advanced Search**: Find specific artworks using filters and search functionality
- **Artist Discovery**: Browse verified artist profiles and portfolios
- **Wishlist & Favorites**: Like and save favorite artworks
- **Direct Contact**: Message artists about artwork inquiries

### For Administrators
- **User Management**: Manage artist verification and user accounts
- **Exhibition Management**: Create and manage art exhibitions and events
- **Content Moderation**: Monitor and moderate platform content
- **Analytics Dashboard**: Track platform usage and performance

### General Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Secure Authentication**: JWT-based authentication with role-based access
- **Real-time Messaging**: Direct communication between artists and buyers
- **Exhibition System**: Upcoming and ongoing art exhibitions
- **Professional UI/UX**: Clean, artistic design with smooth animations

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** for form handling
- **React Query** for data fetching
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Multer** for file uploads
- **Express Validator** for input validation
- **Helmet** for security headers
- **CORS** for cross-origin requests

## 📁 Project Structure

```
sundays-art-hub/
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   │   ├── Navbar.tsx           # Navigation component
│   │   └── ArtworkCard.tsx      # Artwork display component
│   ├── contexts/                # React contexts
│   │   └── AuthContext.tsx      # Authentication context
│   ├── pages/                   # Page components
│   │   ├── Home.tsx            # Landing page
│   │   ├── Browse.tsx          # Artwork browsing page
│   │   ├── Login.tsx           # Login page
│   │   ├── Register.tsx        # Registration page
│   │   └── ArtistDashboard.tsx # Artist dashboard
│   ├── services/               # API service functions
│   │   ├── api.ts              # Axios configuration
│   │   ├── auth.ts             # Authentication services
│   │   └── artwork.ts          # Artwork services
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts            # Main type definitions
│   └── App.tsx                 # Main application component
├── server/                     # Backend Node.js application
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   │   └── authController.ts
│   │   ├── middleware/         # Express middleware
│   │   │   └── auth.ts         # Authentication middleware
│   │   ├── models/            # MongoDB models
│   │   │   ├── User.ts        # User model
│   │   │   ├── Artwork.ts     # Artwork model
│   │   │   ├── Exhibition.ts  # Exhibition model
│   │   │   └── Message.ts     # Message model
│   │   ├── routes/            # API routes
│   │   │   ├── auth.ts        # Authentication routes
│   │   │   ├── artwork.ts     # Artwork routes
│   │   │   ├── user.ts        # User routes
│   │   │   ├── message.ts     # Message routes
│   │   │   └── exhibition.ts  # Exhibition routes
│   │   └── index.ts           # Server entry point
│   ├── package.json           # Backend dependencies
│   └── tsconfig.json          # TypeScript configuration
├── package.json               # Frontend dependencies
├── tailwind.config.js         # Tailwind CSS configuration
└── README.md                  # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sundays-art-hub
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Environment Configuration**
   
   Create a `.env` file in the `server` directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/sundays-art-hub

   # JWT Secret (use a strong, random string)
   JWT_SECRET=your-super-secret-jwt-key-here

   # Cloudinary (for image uploads - optional)
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173
   ```

5. **Create upload directories**
   ```bash
   mkdir -p server/uploads/artworks
   ```

### Running the Application

1. **Start MongoDB**
   Make sure MongoDB is running on your system or you have a connection to MongoDB Atlas.

2. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

3. **Start the frontend development server**
   ```bash
   # In a new terminal, from the root directory
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

### Demo Accounts

The application includes demo accounts for testing:

- **Artist Account**
  - Email: `artist@demo.com`
  - Password: `password123`

- **Community Account**
  - Email: `user@demo.com`
  - Password: `password123`

- **Admin Account**
  - Email: `admin@demo.com`
  - Password: `password123`

## 🔧 Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### API Endpoints

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

**Artworks:**
- `GET /api/artworks` - Get artworks with filters
- `GET /api/artworks/:id` - Get artwork by ID
- `POST /api/artworks` - Create new artwork (artists only)
- `PUT /api/artworks/:id` - Update artwork
- `DELETE /api/artworks/:id` - Delete artwork
- `POST /api/artworks/:id/like` - Like/unlike artwork

**Users:**
- `GET /api/users/artists` - Get all artists
- `GET /api/users/artists/:id` - Get artist by ID

**Messages:**
- `GET /api/messages/conversations` - Get user conversations
- `GET /api/messages/:userId` - Get messages with specific user
- `POST /api/messages` - Send message

**Exhibitions:**
- `GET /api/exhibitions` - Get exhibitions
- `GET /api/exhibitions/:id` - Get exhibition by ID
- `POST /api/exhibitions` - Create exhibition (admin only)
- `POST /api/exhibitions/:id/register` - Register for exhibition

## 🎨 Design System

### Colors
- **Primary**: `#16425b` (Deep Navy)
- **Secondary**: `#d9dcd6` (Soft Sage)
- **Accent**: `#8fb0c4` (Light Blue)

### Typography
- **Display Font**: Poppins (headings)
- **Body Font**: Inter (body text)

### Components
- Responsive grid layouts
- Card-based design
- Smooth animations and transitions
- Mobile-first approach

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Security headers with Helmet
- Role-based access control

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed to platforms like Vercel, Netlify, or any static hosting service:

```bash
npm run build
# Deploy the 'dist' folder
```

### Backend Deployment
The backend can be deployed to platforms like Heroku, Railway, or any Node.js hosting service:

```bash
cd server
npm run build
# Deploy with the 'dist' folder and package.json
```

### Environment Variables for Production
Make sure to set all required environment variables in your production environment, especially:
- `MONGODB_URI` (MongoDB connection string)
- `JWT_SECRET` (strong, unique secret)
- `FRONTEND_URL` (your frontend domain)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Design inspiration from modern art marketplace platforms
- Icons provided by Lucide React
- Stock images from Pexels
- Built with modern web technologies and best practices

---

**The Sundays Art Hub** - Connecting artists with art lovers, one masterpiece at a time. 🎨