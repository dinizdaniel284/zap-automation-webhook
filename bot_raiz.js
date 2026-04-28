const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore,
    Browsers
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

async function iniciarBot() {
    console.log('🚀 AGÊNCIA IA DINIZ - Iniciando Motor Profissional...');

    // 1. Configuração de versão e autenticação
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        browser: Browsers.macOS('Desktop'), // Identifica como computador
        syncFullHistory: false
    });

    sock.ev.on('creds.update', saveCreds);

    // 2. Gerenciamento de Conexão
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.clear();
            console.log('🌸 AGÊNCIA IA DINIZ - SISTEMA DE VENDAS');
            console.log('==========================================');
            qrcode.generate(qr, { small: true });
            console.log('==========================================');
            console.log('Aguardando conexão com o celular da Glacy...');
        }

        if (connection === 'close') {
            const erroCode = lastDisconnect.error?.output?.statusCode;
            console.log(`🔄 Conexão encerrada (Status: ${erroCode}). Reconectando em 5s...`);
            setTimeout(() => iniciarBot(), 5000);
        } else if (connection === 'open') {
            console.log('\n✅ SISTEMA ONLINE - AGÊNCIA IA DINIZ');
            console.log('🚀 Operando modo automação inteligente.\n');
        }
    });

    // 3. Lógica do Menu Inteligente (Ideal para Prints de Portfólio)
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const nomeUsuario = msg.pushName || "Cliente";
        const textoRecebido = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").toLowerCase();

        if (textoRecebido) {
            console.log(`📩 [${nomeUsuario}]: ${textoRecebido}`);

            let resposta = "";

            // Lógica de Resposta por Palavras-Chave
            if (textoRecebido.includes("produto") || textoRecebido.includes("catalogo") || textoRecebido.includes("quais")) {
                resposta = `💄 *Catálogo Loja da Glacy* \n\nOlá ${nomeUsuario}, aqui estão nossos queridinhos:\n\n1️⃣ *Bases Matte* - R$ 45,90\n2️⃣ *Kit SkinCare* - R$ 89,90\n3️⃣ *Perfumes Importados* - Sob consulta\n\nQual deles você deseja saber mais?`;
            } 
            else if (textoRecebido.includes("preco") || textoRecebido.includes("valor") || textoRecebido.includes("quanto")) {
                resposta = `💰 *Tabela de Preços* \n\nTrabalhamos com os melhores valores da região! Aceitamos Pix, Cartão e Dinheiro.\n\nQual produto você gostaria de orçar agora?`;
            }
            else if (textoRecebido.includes("endereco") || textoRecebido.includes("local") || textoRecebido.includes("onde")) {
                resposta = `📍 *Nossa Localização* \n\nEstamos atendendo em Santa Rita do Passa Quatro!\n\nFazemos entregas em toda a cidade. Gostaria de agendar uma entrega?`;
            }
            else {
                // Menu Inicial
                resposta = `Olá *${nomeUsuario}*! ✨ Bem-vinda(o) à *Loja da Glacy*!\n\nSou o assistente virtual da *Agência IA Diniz* e estou aqui para agilizar seu atendimento.\n\nComo posso te ajudar hoje?\n\n👉 Digite *Produtos*\n👉 Digite *Preços*\n👉 Digite *Endereço*`;
            }

            // Envia a resposta com um pequeno delay para parecer humano
            await sock.sendMessage(from, { text: resposta });
            console.log(`✅ Resposta enviada para ${nomeUsuario}`);
        }
    });
}

iniciarBot().catch(err => console.error('❌ Erro crítico:', err));