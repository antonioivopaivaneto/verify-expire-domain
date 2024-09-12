const whois = require("whois");
const moment = require("moment");
const nodemailer = require("nodemailer");
require('dotenv').config();  // Carregar variáveis de ambiente

// Função para criar o transporte de e-mail com nodemailer
function createEmailTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,  // Usar variáveis de ambiente
            pass: process.env.EMAIL_PASS
        }
    });
}

// Função principal para verificar o domínio
function checkDomain(domain) {
    whois.lookup(domain, (err, data) => {
        if (err) {
            console.error('Erro ao consultar WHOIS:', err);
            return;
        }

        const expiryDate = extractExpiryDate(data); // extrai a data da string usando regex
        const domainStatus = extractDomainStatus(data); // extrai o status da string usando regex

        if (expiryDate) {
            console.log(`Data de Expiração: ${expiryDate}`);
            checkExpiryDate(expiryDate, domain);  // usa o moment para verificar a data
        } else {
            console.warn("Data de Expiração não encontrada.");
        }

        if (domainStatus) {
            console.log(`Status do domínio: ${domainStatus}`);
        } else {
            console.warn("Status do domínio não encontrado.");
        }
    });
}

// Extrai a data de expiração do WHOIS (ainda precisamos usar regex para encontrar a data)
function extractExpiryDate(data) {
    const expDateRegex = /expires:\s+(.*)/;
    const match = data.match(expDateRegex);

    // Utiliza moment para tentar formatar corretamente a data
    if (match) {
        const rawDate = match[1].trim();
        const formattedDate = moment(rawDate, 'YYYYMMDD'); // Formato de data com base no WHOIS
        if (formattedDate.isValid()) {
            return formattedDate; // Retorna o objeto moment
        }
    }
    return null;
}

// Extrai o status do domínio do WHOIS
function extractDomainStatus(data) {
    const statusRegex = /status:\s+(.*)/;
    const match = data.match(statusRegex);
    return match ? match[1].trim() : null;
}

// Verifica quantos dias faltam até a expiração
function checkExpiryDate(expiryDate, domain) {
    const today = moment();  // Data de hoje
    const daysRemaining = expiryDate.diff(today, 'days'); // Calcula a diferença em dias

    if (daysRemaining <= 30) {
        console.warn(`Aviso: o domínio expira em ${daysRemaining} dias. Renove o domínio.`);
        sendExpiryAlert(domain, daysRemaining); // Enviar e-mail de alerta
    } else {
        console.log(`O domínio ainda tem ${daysRemaining} dias até expirar.`);
    }
}

// Envia um e-mail de alerta sobre a expiração do domínio
function sendExpiryAlert(domain, daysRemaining) {
    const transporter = createEmailTransporter();

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'antonioivo.3@gmail.com',
        subject: `Aviso: O domínio ${domain} expira em ${daysRemaining} dias`,
        text: `O domínio ${domain} expira em ${daysRemaining} dias. Tome as providências para renovar.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.error('Erro ao enviar o e-mail:', error);
        }
        console.log(`E-mail enviado com sucesso: ${info.response}`);
    });
}

// Executa a verificação do domínio
checkDomain("yupipremios.com.br");
