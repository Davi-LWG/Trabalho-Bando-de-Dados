const express = require('express');
const mysql = require('mysql2/promise')
const path = require('path');
const bodyParser = require('body-parser');


const app = express();
const port = 3000;
let funcionarioTipo;

const connection = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'TrabalhoFinal',
});


app.listen(port,()=>{
    console.log('app running')
});


/*app.get('/',async (req,res)=>{
    const {CPF_Cliente} = await connection.execute('SELECT * FROM cliente WHERE CPF_Cliente=\'111.222.333-44\'');
    //const = await queryRow;
    return res.status(201).json(CPF_Cliente);
})*/


// Middleware para analisar o corpo de requisições POST
app.use(bodyParser.urlencoded({ extended: true }));

// Disponibilizar arquivos estáticos vindos do diretório 'src'
app.use(express.static(path.join(__dirname, 'src')));

// Disponibilizar o aquivo 'index.html' como a URL raiz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/html/index.html'));
});

// tabela dinâmica funcionario
app.get('/dinam_funcionario', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM funcionario');
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// tabela dinâmica produtos
app.get('/dinam_produtos', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM Produto');
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// Lidar com logins de usuáios
app.post('/login', async (req, res) => {
    const { codigo, senha, categoria } = req.body;

    // Credenciais
    const [funcionario] = await connection.query(`SELECT * FROM funcionario WHERE CPF_Funcionario=\'${codigo}'`);
    const validCodigo=(funcionario[0].CPF_Funcionario);
    const validSenha = (funcionario[0].SENHA);
    const validCategoria = 'colaborador';
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

app.post('/pcadastro',(req,res)=>{

})

app.post('/venda',async (req, res) => {
    const {clienteCpf, pCodigo, quantidade, funcCpf} = req.body;
    const [produto] = await connection.query(`SELECT * FROM Produto WHERE Cod_pedido=${pCodigo}`);
    const [cliente] = await connection.query(`SELECT * FROM Cliente WHERE CPF_cliente=\'${clienteCpf}'`);
    const [funcionario] = await connection.query(`SELECT * FROM Funcionario WHERE CPF_Funcionario=\'${funcCpf}'`);
    const data = new Date();

    const idLast = connection.query(`SELECT Cod_Pedido FROM Pedido ORDER BY Cod_Pedido DESC LIMIT 1`);

    connection.execute(`INSERT INTO Pedido(Cod_Pedido, CPF_Cliente, Data_Pedido,Quantidade,CPF_Funcionario) VALUES(${cliente.CPF_Cliente},'${cliente.CPF_Cliente}','${data}',${quantidade},'${funcionario.CPF_Funcionario}'`);
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
                alert("Produto comprado: \nQuantidade: \nO valor da venda foi de R$ ${valorVenda}");
                window.location.href = '/'; // Redirect back to the main page after the alert
            </script>
        </body>
        </html>
    `);

});

