require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, "aura-data.json");

app.use(express.json({ limit: "10mb" }));
app.use(express.static(__dirname));

let database = {
    users: {},
    conversations: {}
};

/* ==========================================
   DATABASE
========================================== */

function loadDatabase() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const raw = fs.readFileSync(DATA_FILE, "utf8");

            if (raw.trim()) {
                database = JSON.parse(raw);
            }
        }

        database.users ||= {};
        database.conversations ||= {};
    } catch (error) {
        console.error("Database load error:", error);

        database = {
            users: {},
            conversations: {}
        };
    }
}

function saveDatabase() {
    try {
        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(database, null, 2),
            "utf8"
        );
    } catch (error) {
        console.error("Database save error:", error);
    }
}

loadDatabase();

/* ==========================================
   USER
========================================== */

function userExists(username) {
    return Boolean(database.users[username]);
}

function getConversation(userId) {
    if (!database.conversations[userId]) {
        database.conversations[userId] = [];
        saveDatabase();
    }

    return database.conversations[userId];
}

/* ==========================================
   HOME
========================================== */

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "intro.html"));
});

/* ==========================================
   API TEST
========================================== */

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "AURA V9 API is working!"
    });
});

/* ==========================================
   REGISTER
========================================== */

app.post("/api/register", async (req, res) => {
    try {
        const username =
            String(req.body.username || "").trim();

        const password =
            String(req.body.password || "");

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: "Username and password are required."
            });
        }

        if (username.length < 2) {
            return res.status(400).json({
                success: false,
                error: "Username must be at least 2 characters."
            });
        }

        if (password.length < 4) {
            return res.status(400).json({
                success: false,
                error: "Password must be at least 4 characters."
            });
        }

        if (userExists(username)) {
            return res.status(400).json({
                success: false,
                error: "User already exists."
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        database.users[username] = {
            username: username,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        database.conversations[username] = [];

        saveDatabase();

        res.json({
            success: true,
            message: "Account created successfully.",
            username: username
        });

    } catch (error) {
        console.error("Register error:", error);

        res.status(500).json({
            success: false,
            error: "Registration failed."
        });
    }
});

/* ==========================================
   LOGIN
========================================== */

app.post("/api/login", async (req, res) => {
    try {
        const username =
            String(req.body.username || "").trim();

        const password =
            String(req.body.password || "");

        const user = database.users[username];

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Invalid username or password."
            });
        }

        const valid =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!valid) {
            return res.status(401).json({
                success: false,
                error: "Invalid username or password."
            });
        }

        res.json({
            success: true,
            username: user.username
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            error: "Login failed."
        });
    }
});

/* ==========================================
   PROFILE
========================================== */

app.get("/api/profile", (req, res) => {
    const userId =
        String(req.query.userId || "").trim();

    if (!userId || !userExists(userId)) {
        return res.status(404).json({
            success: false,
            error: "User not found."
        });
    }

    const user = database.users[userId];

    res.json({
        success: true,
        profile: {
            username: user.username,
            createdAt: user.createdAt
        }
    });
});

/* ==========================================
   HISTORY
========================================== */

app.get("/api/history", (req, res) => {
    const userId =
        String(req.query.userId || "").trim();

    if (!userId || !userExists(userId)) {
        return res.status(404).json({
            success: false,
            error: "User not found."
        });
    }

    res.json({
        success: true,
        history: getConversation(userId)
    });
});

/* ==========================================
   NEW CHAT
========================================== */

app.post("/api/new-chat", (req, res) => {
    const userId =
        String(req.body.userId || "").trim();

    if (!userId || !userExists(userId)) {
        return res.status(404).json({
            success: false,
            error: "User not found."
        });
    }

    database.conversations[userId] = [];

    saveDatabase();

    res.json({
        success: true,
        message: "New chat started."
    });
});

/* ==========================================
   CLEAR HISTORY
========================================== */

app.delete("/api/history", (req, res) => {
    const userId =
        String(req.body.userId || "").trim();

    if (!userId || !userExists(userId)) {
        return res.status(404).json({
            success: false,
            error: "User not found."
        });
    }

    database.conversations[userId] = [];

    saveDatabase();

    res.json({
        success: true,
        message: "Chat history cleared."
    });
});

/* ==========================================
   CHAT
========================================== */

app.post("/api/chat", async (req, res) => {
    try {
        const userId =
            String(req.body.userId || "").trim();

        const message =
            String(req.body.message || "").trim();

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User ID is required."
            });
        }

        if (!message) {
            return res.status(400).json({
                success: false,
                error: "Message is required."
            });
        }

        if (!userExists(userId)) {
            return res.status(401).json({
                success: false,
                error: "Please login first."
            });
        }

        /* CREATOR QUESTION */

        const lowerMessage =
            message.toLowerCase();

        const creatorQuestion =
            lowerMessage.includes("who created you") ||
            lowerMessage.includes("who made you") ||
            lowerMessage.includes("who is your creator");

        if (creatorQuestion) {
            return res.json({
                success: true,
                reply: "S. Yogee created me."
            });
        }

        const history =
            getConversation(userId);

        const userName =
            database.users[userId].username;

        history.push({
            role: "user",
            content: message,
            time: new Date().toISOString()
        });

        const recentHistory =
            history
                .slice(-20)
                .map(item => ({
                    role: item.role,
                    content: item.content
                }));

        /* ==========================================
           AI PROVIDER
           Cloud deployment: set OPENAI_API_KEY in the host's
           environment settings. Never put keys in browser code.
           Local development fallback: Ollama on this machine.
        ========================================== */

        const systemMessage = {
            role: "system",
            content: `
You are AURA V9, the user's personal AI assistant.
The user's name is ${userName}.
Be friendly, helpful and natural.
If the user speaks English, reply in English.
If the user speaks Tamil, reply in Tamil.
If the user speaks Tanglish, reply in Tanglish.
If the user mixes Tamil and English, reply naturally in the same style.
Answer the actual question. Do not give random fixed responses.
`
        };

        let reply = "";

        if (process.env.OPENAI_API_KEY) {
            const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
            const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
            const aiResponse = await fetch(`${baseUrl}/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model,
                    messages: [systemMessage, ...recentHistory],
                    temperature: 0.7
                })
            });
            const aiData = await aiResponse.json().catch(() => ({}));
            if (!aiResponse.ok) {
                console.error("Cloud AI provider error:", aiData.error?.message || aiResponse.status);
                throw new Error(aiData.error?.message || `AI provider returned ${aiResponse.status}`);
            }
            reply = aiData.choices?.[0]?.message?.content?.trim() || "AURA could not generate a response.";
        } else {
            const ollamaResponse = await fetch("http://127.0.0.1:11434/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: process.env.OLLAMA_MODEL || "qwen2.5:1.5b",
                    stream: false,
                    messages: [systemMessage, ...recentHistory]
                })
            });
            const data = await ollamaResponse.json().catch(() => ({}));
            if (!ollamaResponse.ok) {
                throw new Error(data.error || "Ollama request failed.");
            }
            reply = data.message?.content?.trim() || "AURA could not generate a response.";
        }

        history.push({
            role: "assistant",
            content: reply,
            time: new Date().toISOString()
        });

        database.conversations[userId] =
            history.slice(-100);

        saveDatabase();

        res.json({
            success: true,
            reply: reply
        });

    } catch (error) {
        console.error("Chat error:", error);

        res.status(500).json({
            success: false,
            error:
                "AURA AI is unavailable. Make sure Ollama is running."
        });
    }
});

/* ==========================================
   API 404
========================================== */

app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        error: "AURA API endpoint not found."
    });
});

/* ==========================================
   START SERVER
========================================== */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log("=================================");
        console.log("        AURA V9 ONLINE");
        console.log("=================================");
        console.log("AI Engine: Ollama");
        console.log("Model: qwen2.5:1.5b");
        console.log("Chat: ENABLED");
        console.log("Image Generation: REMOVED");
        console.log("Video Generation: REMOVED");
        console.log("Music: ENABLED");
        console.log("Kural Voice: ENABLED");
        console.log(`Server running on port ${PORT}`);
        console.log("=================================");
    }
);
