require('dotenv').config();
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const INSTANCE_ID = process.env.INSTANCE_ID;
const CLIENT_TOKEN = process.env.CLIENT_TOKEN;

app.post("/webhook", async (req, res) => {
    const data = req.body;
    let phone = data.phone || data.sender;

    // 1. O sistema só age se tiver um número e NÃO for mensagem enviada pela própria Glacy
    if (phone && !data.fromMe) {
        
        const cleanPhone = phone.replace("@s.whatsapp.net", "").replace(/\D/g, "");
        const isGroup = phone.includes("@g.us") || phone.includes("@newsletter") || phone.includes("@broadcast");

        // 2. Se NÃO for grupo, a IA atende o cliente (seja você, eu ou um comprador de maquiagem)
        if (!isGroup) {
            
            console.log(`📩 NOVO CLIENTE NA LOJA DA GLACY: ${cleanPhone}`);

            try {
                // Aqui entra o Prompt da Loja de Cosméticos
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