const express = require('express'); // получаем доступ к node
const path = require('path'); // позвольяет узнать путь
const {readFile} = require('fs');
const app = express();
const port = 3000;

const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectId;
const mongoClient = new MongoClient("mongodb://localhost:27017/");
let dbClient;

//используем парсер, чтобы из json  получить js объект
app.use(express.json());
app.use(express.urlencoded({extended: true}));
//app.express(app.static())

app.set('view engine', 'ejs'); //как используется шаблонизатор (ejs)
app.set('views', path.join(__dirname, 'views')); // где лежат шаблоны
app.use(express.static(__dirname + '/public'));

function Comment(_name, _content) {
    this.name = _name;
    this.content = _content;
} // финкция ( конструктор), кот генерирует комментарии

// function Post() {
//     this.title = faker.random.words()
//     this.content = faker.lorem.paragraph()
//     this.comments = [];
//     for (let i = 0; i < Math.random()*10; i++){
//         this.comments.push(new Comment(faker.name.firstname(),faker.lorem.paragraph() ));
//     }
// }

posts = [];
const postFilePath = "./posts.json";
readFile(postFilePath, (err, data) => {
    if (err) throw err
    console.log(`File ${postFilePath} read successfully`)

    let jsonString = data.toString();
    posts = JSON.parse(jsonString);

    for (const key in posts) {
        posts[key].date = new Date();
    }
    console.log('Posts date read successfully')
})

app.get('/error', (req, res) => {
    res.render('error')
})

//асинхронная функция, подключаем коллекции из бд
;(async () => {
    try {
        await mongoClient.connect();
        app.locals.collection_1 = mongoClient.db("test").collection("articles");
        app.locals.collection_2 = mongoClient.db("test").collection("comments");
        await app.listen(port);
        console.log("Сервер ожидает подключения...");
    } catch (err) {
        return console.log(err);
    }
})();

app.get("/", async (req, res) => {

    const collection = req.app.locals.collection_1;
    let articles;
    try {
        articles = await collection.find({}).toArray();
    } catch (err) {
        return console.log(err);
    }
    res.render('main', {title: "Blog: my posts", posts: articles});
});

app.post('/post/:id', async (req, res, next) => {
    let id = req.params["id"];
    console.log(id);
    if (isNaN(id))
        next();
    let name = req.body["name"]
    let content = req.body["content"]
    const collection_2 = req.app.locals.collection_2;
    let comments;
    try {
        comments = await collection_2.findOne({_id: id});
        comments.data.push({name: name, content: content});
        let newDocument = {data: comments.data};
        await collection_2.findOneAndReplace({_id: id}, newDocument);
    } catch (err) {
        return console.log(err);
    }
    res.redirect("/post/" + id);
    console.log(`req(${req.url}) ${name} ${content}`)

})

app.get("/post/:id", async (req, res, next) => {
    let id = req.params["id"];
    console.log(id);
    if (isNaN(id))
        next();
    const collection_1 = req.app.locals.collection_1;
    const collection_2 = req.app.locals.collection_2;
    let articles;
    let comments;
    try {
        articles = await collection_1.findOne({_id: id});
        comments = await collection_2.findOne({_id: id});
    } catch (err) {
        return console.log(err);
    }
    if (articles === null || comments === null)
        next();
    res.render('article', {
        post: articles.data[0], comments: comments.data
    })
});


app.use((req, res, next) => {
        res.status(404);
        res.redirect("/error");
    }
)