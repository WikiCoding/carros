const pg = require('pg');
const { response } = require('express');
const express = require('express');
const app = express();
app.use(express.json())
require('dotenv').config();

const conString = process.env.CONNECTION_STRING;
const db = new pg.Client(conString);

const port = process.env.PORT;

app.get('/', (request, response) => {
    response.sendFile(`${__dirname}/index.html`);
}); //serving the html file!

app.get("/carros", async (req, res) => {
    try {
        const rows = await render();
        res.setHeader("content-type", "application/json")
        res.send(JSON.stringify(rows))
    }
    catch (err) {
        console.log(err);
    }
});

app.post('/carros', async (req, res) => {
    let result = {};
    try {
        const reqJson = req.body;
        result.success = await createEntry(reqJson.id, reqJson.marca, reqJson.modelo);
    }
    catch (err) {
        console.log('err@post_call')
        result.success = false;
    }
    finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result));
        //await client.end();
    }
});

app.delete("/carros", async (req, res) => {
    let result = {};
    try {
        const reqJson = req.body;
        result.success = await deleteCarro(reqJson.id);
        console.log(result.success);
    }
    catch (e) {
        console.log('err@delete_call')
        result.success = false;
    }
    finally {
        res.setHeader("content-type", "application/json")
        res.send(JSON.stringify(result));
        //console.log(result);
    }
});


app.listen(port, () => {
    console.log(`server started on ${port}`);
});

///////////////////////////////////////////////////////////

async function start() {
    await connect();
};

async function connect() {
    try {
        await db.connect();
    }
    catch (e) {
        console.error(`Failed to connect ${e}`);
    }
};

async function render() {
    try {
        await start();
        const results = await db.query("SELECT id, marca, modelo FROM carros_prod ORDER BY id");
        return results.rows;
    } catch (e) {
        console.log('err@render_function', e)
        return [];
    }
};

async function createEntry(id, marca, modelo) {
    try {
        await db.query("INSERT INTO carros_prod (id, marca, modelo) VALUES ($1, $2, $3)", [id, marca, modelo]);
        return true
    } catch (err) {
        console.log('err@create_function')
        return false
    }
};

async function deleteCarro(id) {
    try {
        await db.query("DELETE FROM carros_prod WHERE id = $1", [id]);
        return true;
    }
    catch (e) {
        console.log('err@delete_function')
        return false;
    }
};
