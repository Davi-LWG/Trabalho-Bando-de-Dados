const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
let funcionarioTipo;

// Middleware para analisar o corpo de requisições POST
app.use(bodyParser.urlencoded({ extended: true }));

// Disponibilizar arquivos estáticos vindos do diretório 'src'
app.use(express.static(path.join(__dirname, 'src')));

// Disponibilizar o aquivo 'index.html' como a URL raiz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/html/index.html'));
});

// Lidar com logins de usuáios
app.post('/login', (req, res) => {
    const { codigo, senha, categoria } = req.body;

    // Credenciais
    const validCodigo = '123';
    const validSenha = '123';
    const validCategoria = 'gerente';
    funcionarioTipo = validCategoria;

    // Verificação das credenciais
    if ((codigo === validCodigo) && (senha === validSenha) && (categoria == validCategoria)) {
        if (categoria == 'gerente'){
            res.redirect('/html/F_gerenteGUI.html');
        }
        res.redirect('/html/F_colaboradorGUI.html');
    } else {
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Invalid Data</title>
            </head>
            <body>
                <script>
                    alert('Dados inválidos. Por favor, tente novamente.');
                    window.location.href = '/'; // Redirect back to the main page after the alert
                </script>
            </body>
            </html>
        `);
    }
});

app.post('/venda', (req, res) => {
    const {pCodigo, quantidade} = req.body;

    const custoProduto = 15;
    let valorVenda = custoProduto*quantidade;

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invalid Data</title>
        </head>
        <body>
            <script>
                alert("O valor da venda foi de R$ ${valorVenda}");
                window.location.href = '/'; // Redirect back to the main page after the alert
            </script>
        </body>
        </html>
    `);

});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
