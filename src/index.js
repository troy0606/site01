const express = require('express');


const url = require('url');

const bodyParser = require('body-parser');

const app = express();
// express是預設function

const app2 = express();

// const urlencodedParser = bodyParser.urlencoded({extended: false});

const multer = require('multer');
const upload = multer({ dest: 'tmp_uploads/' });

const fs = require('fs');


app.use(bodyParser.urlencoded({ extended: false }));
// 路由設定只要使用get以外的方法就執行bodyParser
// get 資料在header

app.use(bodyParser.json());

app.set("view engine", 'ejs');

app.get('/', (req, res) => {

    res.render('home', { name: 'BenSon' });
});

app.get('/b.html', (req, res) => {
    res.send("<style>h2{color:red}</style><h2>Hello</h2><br><button>Click</button><script>alert('Hi');</script>");
    // 動態產生b.html 內容
});


app.use(express.static('public'));
// 靜態網頁內容須放在路由設定前
// public 資料夾為所有網頁根目錄

// routes 路由(可定義多個/但要用不同的port)

app.get('/abc', (req, res) => {
    // 只允許檔案用get方式拜訪
    res.send("~~~~~~~~~~~");
    // send送完就結束
    // res.send("Hiiiii") 不會跑;
});

// --queryString
app.get('/try', (req, res) => {
    const urlParts = url.parse(req.url, true);
    // true會解析成字串
    console.log(urlParts);

    res, render('try-qs', {
        query: urlParts.query
    })

});

// --queryString end    

// --tryPostForm
app.get('/try', (req, res) => {
    const urlParts = url.parse(req.url, true);
    // true會解析成字串
    console.log(urlParts);

    res, render('try-qs', {
        query: urlParts.query
    })

});
// --tryPostForm end

app.get('/tryPost', (req, res) => {
    res.render('try-post-form');
});
app.post('/tryPost', (req, res) => {
    // res.send(JSON.stringify(req.body));
    // urlencodedParser 

    res.render('try-post-form', req.body);
});

app.get('/tryPost/123', (req, res) => {
    res.render('try-post-form');
});


// --test different way
app.get('/tryPost2', (req, res) => {
    res.send('get : send response by get');
});

app.post('/tryPost2', (req, res) => {
    res.json(req.body);
});

app.put('/tryPost2', (req, res) => {
    res.send('put : send response by put');
});
// --test different way end

app.get('/sales02', (req, res) => {
    // 伺服器執行
    const sales = require('./../data/sales01');
    // 後端載入JSON


    res.render('sales01', {
        // render預設使用資料夾view中的檔案(可省略副檔名)，指定使用哪個template

        sales: sales
        // 傳入sales01使用物件
        // key(傳入sales01使用的變數): value(使用的資料/require進來的)
    });
});


app2.get('/', (req, res) => {
    res.send("Hiiiii");
});

app.post('/try-uploads', upload.single('avatar'), (req, res) => {
    // middleware :upload.single 處理avatar欄位資訊放入req.file屬性
    // console.log(req.file);
    // res.send('ok');

    if (req.file && req.file.originalname) {
        console.log(req.file);

        switch (req.file.mimetype) {
            case 'image/png':
            case 'image/jpeg':

                // createReadStream建立串流
                fs.createReadStream(req.file.path)
                    .pipe(
                        // 將來源內容倒到另一個地方
                        fs.createWriteStream('public/img/' + req.file.originalname)
                        // (pipe)參數不要+分號
                    );
                res.send('ok');
                break;
            default:
                return res.send('bad file type');
        }
    } else {
        res.send('no uploads');
    }

});

app.post('/uploads_img', upload.array('avatar[]', 6), (req, res) => {
    let pic_array = [];
    console.log(req.files);
    for (i = 0; i < req.files.length; i++) {
        if (req.files[i] && req.files[i].originalname) {
            switch (req.files[i].mimetype) {
                case 'image/png':
                case 'image/jpeg':
                    fs.createReadStream(req.files[i].path)
                        .pipe(
                            // 將來源內容倒到另一個地方
                            fs.createWriteStream('public/img/' + req.files[i].originalname)
                        );
                    pic_array.push(req.files[i].originalname)
                    break;
                default:
                    return res.send('bad file type');
            }
        } else {
            res.send('no uploads');
        }
    };
    console.log(pic_array);
    res.json(pic_array);
});


// 放在所有路由設定後面，如果上面路由設定沒跑，則跑到這
app.use((req, res) => {
    // res.type('text/plain');
    res.status(404);
    // res.send('找不到網頁');
    res.render('home', {

    })
})
app.listen(3000, () => {
    console.log("server started at port:3000")
})

app2.listen(5000, () => {
    console.log("server started at port:5000")
})