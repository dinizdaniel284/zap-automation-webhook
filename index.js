const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

// Removi o cabeçalho do ngrok pois na Render não é mais necessário, 
// mas deixei uma versão genérica para evitar qualquer bloqueio de browser.
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

const INSTANCE_ID = "3F1E9EE3CC3B92CDF6826E59E5E6857E";
const CLIENT_TOKEN = "F4A964C23AE8C82808F3E726";

app.post("/webhook", async (req, res) => {
    const data = req.body;
    
    let phone = data.phone || data.sender;

    // Filtro para ignorar Grupos, Newsletters e Broadcasts
    const isGroup = phone && (phone.includes("@g.us") || phone.includes("@newsletter") || phone.includes("@broadcast"));

    if (phone && !data.fromMe && !isGroup) {
        
        const cleanPhone = phone.replace("@s.whatsapp.net", "");
        const maskedPhone = cleanPhone.substring(0, 7) + "****";

        console.log(`📩 MSG RECEBIDA DE: ${maskedPhone}`);

        try {
            await axios.post(`https://api.z-api.io/instances/${INSTANCE_ID}/send-text`, {
                phone: cleanPhone,
                message: "⚠️ *AVISO DE TESTE TÉCNICO*\n\n(Favor desconsiderar esta mensagem)\n\nOlá! Este é um teste automático de integração da *Agência IA Diniz* para validação de sistema na plataforma Workana. \n\nEm breve o sistema oficial estará online! 🚀"
            }, { 
                headers: { 'client-token': CLIENT_TOKEN } 
            });

            console.log(`✅ RESPOSTA ENVIADA PARA: ${maskedPhone}`);
        } catch (error) {
            console.error("❌ ERRO NA Z-API:", error.response?.data || error.message);
        }
    }

    res.status(200).send("OK");
});

// --- AJUSTE PARA A RENDER ---
// A Render define a porta automaticamente na variável de ambiente process.env.PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log("==========================================");
    console.log(`🚀 AGÊNCIA IA DINIZ - CLOUD MODE (RENDER)`);
    console.log(`📡 ESCUTANDO NA PORTA: ${PORT}`);
    console.log("==========================================");
});