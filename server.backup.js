require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// ==========================================
// TEST
// ==========================================

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "AURA V9 API is working!"
    });
});

// ==========================================
// LOCAL AI CHAT - OLLAMA
// ==========================================

app.post("/api/chat", async (req, res) => {

    try {

        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: "Message is required."
            });
        }

        const response = await fetch("http://127.0.0.1:11434/api/chat", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                model: "qwen2.5:1.5b",
                stream: false,

                messages: [
                    {
                        role: "system",
                        content: `
You are AURA V9, a friendly multilingual personal AI assistant.

Rules:
- Understand any language the user uses.
- Reply in the same language as the user.
- Understand mixed languages and Tanglish.
- Be clear, helpful and concise.
- Do not unnecessarily translate the user's message.
`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Ollama request failed."
            );
        }

        res.json({
            success: true,
            reply: data.message.content
        });

    } catch (error) {

        console.error("AURA Local AI Error:", error);

        res.status(500).json({
            success: false,
            error: "AURA local AI could not respond."
        });
    }
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log("=================================");
    console.log("        AURA V9 ONLINE");
    console.log("=================================");
    console.log("AI Engine: Ollama");
    console.log("Model: qwen2.5:1.5b");
    console.log(`Server: http://localhost:${PORT}`);

});