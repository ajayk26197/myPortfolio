import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import connectDB from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import Project from "./models/Project.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Portfolio API is running",
        endpoints: {
            auth: "/api/auth",
            projects: "/api/projects",
            contact: "/api/contact",
        },
    });
});

const defaultProjects = [
    {
        icon: '🛒',
        title: 'E-Commerce Platform',
        description: 'A full-stack e-commerce application with authentication, product management, cart, and payment integration.',
        stack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        github: '#',
        live: '#',
        order: 1,
    },
    {
        icon: '🤖',
        title: 'AI Chat Assistant',
        description: 'A conversational AI chatbot powered by an LLM API with context memory and a beautiful streaming UI.',
        stack: ['Python', 'FastAPI', 'React', 'OpenAI'],
        github: '#',
        live: '#',
        order: 2,
    },
    {
        icon: '📊',
        title: 'Portfolio Dashboard',
        description: 'Real-time analytics dashboard with charts, filters, and live data fetching for portfolio metrics.',
        stack: ['React', 'D3.js', 'Express', 'WebSocket'],
        github: '#',
        live: '#',
        order: 3,
    },
    {
        icon: '🧠',
        title: 'ML Image Classifier',
        description: 'A deep learning model that classifies images with 95%+ accuracy, deployed as a REST API.',
        stack: ['Python', 'TensorFlow', 'Flask', 'Docker'],
        github: '#',
        live: '#',
        order: 4,
    },
    {
        icon: '💬',
        title: 'Real-Time Chat App',
        description: 'Group chat application with real-time messaging, online presence, and media sharing.',
        stack: ['React', 'Socket.io', 'Node.js', 'MongoDB'],
        github: '#',
        live: '#',
        order: 5,
    },
    {
        icon: '📝',
        title: 'Task Manager',
        description: 'Kanban-style task manager with drag-and-drop, team collaboration, and deadline reminders.',
        stack: ['React', 'Express', 'PostgreSQL', 'JWT'],
        github: '#',
        live: '#',
        order: 6,
    },
];

const seedProjectsIfEmpty = async () => {
    try {
        const count = await Project.countDocuments();
        if (count === 0) {
            console.log('Seeding initial default projects into MongoDB...');
            await Project.insertMany(defaultProjects);
            console.log('Default projects seeded successfully!');
        }
    } catch (error) {
        console.error('Error seeding projects:', error.message);
    }
};

// Connect to DB for Serverless execution
connectDB().then(() => seedProjectsIfEmpty()).catch(console.error);

if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

export default app;