const whois = require("whois");
const moment = require("moment");
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jockerpaiva21@gmail.com',
        pass: 'hxte arjb knpe kgcj' // Recomendado utilizar variáveis de ambiente para a senha
    }
});

function verifyDomain(domain) {
    whois.lookup(domain, (err, data) => {
        if (err) {
            console.log(err);
            return;
        }

        // Ajustar as regex para formato do registro.br
        const expDateRegex = /expires:\s+(.*)/;
        const statusRegex = /status:\s+(.*)/;

        const expiryMatch = data.match(expDateRegex);
        const statusMatch = data.match(statusRegex);

        if (expiryMatch) {
            const dateExpires = expiryMatch[1].trim();
            console.log(`Data de Expiração: ${dateExpires}`);

            // Chama a função para verificar o prazo de expiração
            verifyExpiry(dateExpires, domain);

        } else {
            console.log("Data de Expiração não encontrada");
        }

        if (statusMatch) {
            console.log(`Status: ${statusMatch[1].trim()}`);
        } else {
            console.log("Status do domínio não encontrado");
        }
    });
}

function verifyExpiry(dateExpire, domain) {
    const expDate = moment(dateExpire, 'YYYY-MM-DD');
    const today = moment();

    const daysRemaining = expDate.diff(today, 'days');

    if (daysRemaining <=  150) {
        console.log(`Aviso: o domínio expira em ${daysRemaining} dias. Por favor, renove o domínio`);

        // Enviar o e-mail de aviso
        sendEmail(domain, daysRemaining);
    } else {
        console.log(`O domínio ainda tem ${daysRemaining} dias até expirar.`);
    }
}

function sendEmail(domain, daysRemaining) {
    let mailOptions = {
        from: 'jockerpaiva21@gmail.com',
        to: 'antonioivo.3@gmail.com',
        subject: `Aviso: O domínio ${domain} expira em ${daysRemaining} dias. Por favor, renove.`,
        text: `O domínio ${domain} expira em ${daysRemaining} dias. Por favor, tome as providências para renovar.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(`Erro ao enviar o e-mail: ${error}`);
        }
        console.log(`E-mail enviado: ${info.response}`);
    });
}

// Verifica o domínio
verifyDomain("yupipremios.com.br");
