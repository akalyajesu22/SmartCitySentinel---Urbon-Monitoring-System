const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🔥 MongoDB Database Connected Successfully!"))
    .catch(err => console.error("❌ Database Connection Error: ", err));

const IssueSchema = new mongoose.Schema({
    title: String,
    location: String,
    description: String,
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

const Issue = mongoose.model('Issue', IssueSchema);

io.on('connection', (socket) => {
    console.log(`📡 New Terminal Connected: ${socket.id}`);
});

app.post('/api/issues', async (req, res) => {
    try {
        const newIssue = new Issue(req.body);
        await newIssue.save();
        io.emit('new-incident-alert', newIssue); // Real-time push
        res.status(201).json({ success: true, message: 'Issue registered!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/issues', async (req, res) => {
    try {
        const issues = await Issue.find().sort({ createdAt: -1 });
        res.json(issues);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Sentinel Engine with WebSockets active on port ${PORT}`);
});