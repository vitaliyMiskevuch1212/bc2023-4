const http = require("http");
const fs = require('fs');
const xml = require("fast-xml-parser");



const parser = new xml.XMLParser();
const builder = new xml.XMLBuilder();
const host = 'localhost';
const port = 8000;

const requestListener = function (req,res) {

    // читання файлу data.xml
    fs.readFile("data.xml", (err, data) => {
        if (err) {
            console.log("error");
            res.writeHead(400);
        } else {

            //xml заголовок
            res.setHeader('Content-Type', 'text/xml');
            res.writeHead(200);

            // парсимо дані з data.xml у масив
            const obj = parser.parse(data.toString())['indicators']['basindbank'];

            const filtered = obj.filter(v => v.parent == 'BS3_BanksLiab');

            const txten = [];
            for (const i of filtered) {
                txten.push(i['txten']);
            }

            const values = [];
            for (const i of filtered) {
                values.push(i['value']);
            }

            // створюємо новий xml об'єкт
            const newObj = builder.build({
                data: {
                    indicators: txten.map((txtItem, index) => ({
                        txt: txtItem,
                        value: values[index]
                    }))
                }
            });

            // виводимо дані формату xml за запитом
            res.end(newObj);
        }
    });
};


const server = http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});