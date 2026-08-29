const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");

const app = express();

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname)));

/*
==================================================
TEMPORARY SERVERLESS DATABASE
==================================================

IMPORTANT:
Vercel Functions are serverless.
This memory is NOT permanent storage.

For production login/history persistence,
a real database is required.
*/

const users = {};
const conversations = {};

/* ================================================
   HELPERS
================================================ */

function clean(value) {
    return String(value || "").trim();
}

function userExists(username) {
    return Boolean(users[username]);
}

function getConversation(userId) {
    if (!conversations[userId]) {
        conversations[userId] = [];
    }

    return conversations[userId];
}

/* ================================================
   HOME
================================================ */

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "intro.html")
    );
});

/* ================================================
   TEST
================================================ */

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "AURA V9 Vercel API is working."
    });
});

/* ================================================
   REGISTER
================================================ */

app.post("/api/register", async (req, res) => {

    try {

        const username =
            clean(req.body.username);

        const password =
            String(req.body.password || "");

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error:
                    "Username and password are required."
            });
        }

        if (username.length < 2) {
            return res.status(400).json({
                success: false,
                error:
                    "Username must be at least 2 characters."
            });
        }

        if (password.length < 4) {
            return res.status(400).json({
                success: false,
                error:
                    "Password must be at least 4 characters."
            });
        }

        if (userExists(username)) {
            return res.status(400).json({
                success: false,
                error:
                    "User already exists."
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        users[username] = {
            username,
            password: hashedPassword,
            createdAt:
                new Date().toISOString()
        };

        conversations[username] = [];

        return res.json({
            success: true,
            message:
                "Account created successfully.",
            username
        });

    } catch (error) {

        console.error(
            "Register error:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                "Registration failed."
        });
    }
});

/* ================================================
   LOGIN
================================================ */

app.post("/api/login", async (req, res) => {

    try {

        const username =
            clean(req.body.username);

        const password =
            String(req.body.password || "");

        const user =
            users[username];

        if (!user) {
            return res.status(401).json({
                success: false,
                error:
                    "Invalid username or password."
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
                error:
                    "Invalid username or password."
            });
        }

        return res.json({
            success: true,
            username: user.username
        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                "Login failed."
        });
    }
});

/* ================================================
   PROFILE
================================================ */

app.get("/api/profile", (req, res) => {

    const userId =
        clean(req.query.userId);

    if (!userId || !userExists(userId)) {
        return res.status(404).json({
            success: false,
            error:
                "User not found."
        });
    }

    const user =
        users[userId];

    return res.json({
        success: true,

        profile: {
            username:
                user.username,

            createdAt:
                user.createdAt
        }
    });
});

/* ================================================
   HISTORY
================================================ */

app.get("/api/history", (req, res) => {

    const userId =
        clean(req.query.userId);

    if (!userId || !userExists(userId)) {
        return res.status(404).json({
            success: false,
            error:
                "User not found."
        });
    }

    return res.json({
        success: true,
        history:
            getConversation(userId)
    });
});

/* ================================================
   NEW CHAT
================================================ */

app.post("/api/new-chat", (req, res) => {

    const userId =
        clean(req.body.userId);

    if (!userId || !userExists(userId)) {
        return res.status(404).json({
            success: false,
            error:
                "User not found."
        });
    }

    conversations[userId] = [];

    return res.json({
        success: true,
        message:
            "New chat started."
    });
});

/* ================================================
   CLEAR HISTORY
================================================ */

app.delete("/api/history", (req, res) => {

    const userId =
        clean(req.body.userId);

    if (!userId || !userExists(userId)) {
        return res.status(404).json({
            success: false,
            error:
                "User not found."
        });
    }

    conversations[userId] = [];

    return res.json({
        success: true,
        message:
            "Chat history cleared."
    });
});

/* ================================================
   CHAT
================================================ */

app.post("/api/chat", (req, res) => {

    try {

        const userId =
            clean(req.body.userId);

        const message =
            clean(req.body.message);

        if (!userId || !userExists(userId)) {
            return res.status(401).json({
                success: false,
                error:
                    "Please login first."
            });
        }

        if (!message) {
            return res.status(400).json({
                success: false,
                error:
                    "Message is required."
            });
        }

        const history =
            getConversation(userId);

        history.push({
            role: "user",
            content: message,
            time:
                new Date().toISOString()
        });

        /*
        ==========================================
        TEMPORARY VERCEL RESPONSE
        ==========================================

        Ollama was removed because
        127.0.0.1:11434 is your local computer,
        not Vercel.

        Real AI provider can be connected here later.
        */

        const lower =
            message.toLowerCase();

        let reply;

        if (
            lower.includes("who created you") ||
            lower.includes("who made you") ||
            lower.includes("who is your creator")
        ) {

            reply =
                "I am AURA V9, created as part of the AURA V9 project.";

        } else if (
            lower.includes("hello") ||
            lower.includes("hi") ||
            lower.includes("vanakkam")
        ) {

            reply =
                "Vanakkam! 👋 AURA V9 is online.";

        } else {

            reply =
                "AURA V9 is online, but the AI engine is not connected yet. The Vercel server is working correctly.";
        }

        history.push({
            role: "assistant",
            content: reply,
            time:
                new Date().toISOString()
        });

        conversations[userId] =
            history.slice(-100);

        return res.json({
            success: true,
            reply
        });

    } catch (error) {

        console.error(
            "Chat error:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                "AURA chat service failed."
        });
    }
});

/* ================================================
   API 404
================================================ */

app.use("/api", (req, res) => {

    return res.status(404).json({
        success: false,
        error:
            "AURA API endpoint not found."
    });
});

/* ================================================
   VERCEL EXPORT
================================================ */

module.exports = app;
