// server.js
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const HF_API_KEY = "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";
const HF_MODEL = "HuggingFaceH4/zephyr-7b-beta";


app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      { inputs: message },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const generated = response.data?.generated_text || response.data[0]?.generated_text;
    res.json({ reply: generated || "No response from model." });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Error contacting Hugging Face API" });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(` Chatbot listening on http://localhost:${PORT}`);
});
