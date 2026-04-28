require('dotenv').config();
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

// === ROTA DE BOAS-VINDAS DA AGÊNCIA IA DINIZ ===
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Agência IA Diniz - API</title></head>
      <body style="background-color: #0b0e14; color: #a855f7; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 10px; text-shadow: 0 0 10px #a855f7;">🚀 Agência IA Diniz</h1>
        <p style="font-size: 1.2rem; color: #94a3b8;">Sistema de Automação Online e 100% Operacional</p>
        <div style="margin-top: 20px; padding: 15px 30px; border: 2px solid #a855f7; border-radius: 50px; box-shadow: 0 0 15px #a855f7;">
          <span style="color: #22c55e;">●</span> STATUS: CONECTADO À NUVEM
        </div>
        <p style="margin-top: 50px; font-size: 0.8rem; color: #475569;">Desenvolvido por Daniel Diniz | ADS 2027</p>
      </body>
    </html>
  `);
});

const INSTANCE_ID = process.env.INSTANCE_ID;
const CLIENT_TOKEN = process.env.CLIENT_TOKEN;

app.post("/webhook", async (req, res) => {
    const data = req.body;
    let phone = data.phone || data.sender;

    if (phone && !data.fromMe) {
        const cleanPhone = phone.replace("@s.whatsapp.net", "").replace(/\D/g, "");
        const isGroup = phone.includes("@g.us") || phone.includes("@newsletter") || phone.includes("@broadcast");

        if (!isGroup) {
            console.log(`📩 NOVO CLIENTE NA LOJA DA GLACY: ${cleanPhone}`);
            try {
                const mensagemParaCliente = "Olá! ✨ Bem-vinda(o) à Loja da Glacy! \n\nEstamos processando seu pedido de cosméticos. Como posso te ajudar a ficar ainda mais linda(o) hoje? 💄";
                await axios.post(`https://api.z-api.io/instances/${INSTANCE_ID}/send-text`, {
                    phone: cleanPhone,
                    message: mensagemParaCliente
                }, { 
                    headers: { 'client-token': CLIENT_TOKEN } 
                });
                console.log(`✅ ATENDIMENTO REALIZADO PARA: ${cleanPhone}`);
            } catch (error) {
                console.error("❌ ERRO NA Z-API:", error.response?.data || error.message);
            }
        }
    }
    res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log("==========================================");
    console.log(`🌸 LOJA DA GLACY - IA ONLINE`);
    console.log(`🚀 AGÊNCIA IA DINIZ - ATENDENDO TODOS OS CLIENTES`);
    console.log("==========================================");
});
