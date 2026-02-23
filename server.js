const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

app.post('/chat', async (req, res) => {
    const { message, userId } = req.body;
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', 
        { model: "google/gemini-2.0-flash-001", messages: [{role: "user", content: message}] },
        { headers: { 'Authorization': `Bearer ${OPENROUTER_KEY}` } });

        const reply = response.data.choices[0].message.content;
        await supabase.from('chat_memory').insert([{ user_id: userId, role: 'assistant', content: reply }]);
        res.json({ reply });
    } catch (err) {
        res.status(500).json({ error: "Brain is busy!" });
    }
});

app.listen(3000, () => console.log("AI Swarm is Running!"));
