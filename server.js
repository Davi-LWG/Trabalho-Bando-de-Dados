const express = require('express');
const mysql = require('mysql2/promise')
const path = require('path');
const bodyParser = require('body-parser');
const { CONNREFUSED } = require('dns');


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

//Tabela de produtos
app.get('/dinam_produtos', async (req, res) => {
    try {
        const [rows] = await connection.query('SELECT * FROM Produto');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//Tabela de produtos
app.get('/dinam_vendas', async (req, res) => {
    try {
        const [rows] = await connection.query('SELECT * FROM Pedidos');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Lidar com logins de usuáios
app.post('/login', async (req, res) => {
    const { codigo, senha, categoria } = req.body;

    try{
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
}catch(error){
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

//lidar com vendas
app.post('/venda',async (req, res) => {
    const {clienteCpf, pCodigo, quantidade, funcCpf} = req.body;
    try{
    const [produto] = await connection.query(`SELECT * FROM Produto WHERE Cod_produto=${pCodigo}`);
    const [cliente] = await connection.query(`SELECT * FROM Cliente WHERE CPF_cliente=\'${clienteCpf}'`);
    const [funcionario] = await connection.query(`SELECT * FROM Funcionario WHERE CPF_Funcionario=\'${funcCpf}'`);
    const data = new Date();
    const dataISO = data.toISOString().split('T')[0];
    console.log(data);

    connection.execute(`INSERT INTO Pedido(CPF_Cliente, Data_Pedido, Quantidade, CPF_Funcionario) VALUES('${cliente[0].CPF_Cliente}','${dataISO}',${quantidade},'${funcionario[0].CPF_Funcionario}')`);
    const [codUltimoPedido] = await connection.query(`SELECT MAX(Cod_Pedido) AS Cod_Pedido FROM pedido`);
    connection.execute(`INSERT INTO itens_pedido(Cod_Pedido,Cod_produto,quantidade) VALUES('${codUltimoPedido[0].Cod_Pedido}',${pCodigo}, ${quantidade})`);
    res.send(
        `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Venda efetuada</title>
            </head>
            <body>
                <script>
                    alert('Venda realizada com sucesso');
                    window.location.href = '/html/P_venda.html'; // Redirect back to the main page after the alert
                </script>
            </body>
            </html>
        `
    );
    
    }catch(err){
        res.send(
            `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Erro na venda</title>
            </head>
            <body>
                <script>
                    alert('Venda não realizada');
                    window.location.href = '/html/P_venda.html'; // Redirect back to the main page after the alert
                </script>
            </body>
            </html>
        `
        );
        
    }
});

// editar nome de um produto
app.post('/edicao_nome', async (req, res) => {
    const { pCodigo, nome } = req.body;
    await connection.query(`UPDATE produto SET Nome_produto = '${nome}' where Cod_produto=${pCodigo}`);
});


// editar categoria de um produto
app.post('/edicao_categoria', async (req, res) => {
    const { pCodigo, categoria } = req.body;
    await connection.query(`UPDATE produto SET Categoria = '${categoria}' where Cod_produto=${pCodigo}`);
});


// editar preco de um produto
app.post('/edicao_preco', async (req, res) => {
    const { pCodigo, preco } = req.body;
    await connection.query(`UPDATE produto SET Preco = ${preco} where Cod_produto=${pCodigo}`);
});


// editar promoção de um produto
app.post('/edicao_promocao', async (req, res) => {
    const { pCodigo, promocao } = req.body;
    await connection.query(`UPDATE produto SET Promocao = ${promocao} where Cod_produto=${pCodigo}`);
});


// editar fornecedor de um produto
app.post('/edicao_fornecedor', async (req, res) => {
    const { pCodigo, fornecedor } = req.body;
    await connection.query(`UPDATER Produto SET Cod_Fornecedor = ${fornecedor} where Cod_produto=${pCodigo}`);
});