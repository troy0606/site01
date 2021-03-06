// --require--
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

const session = require('express-session');

const moment = require('moment-timezone');

// --connect db--
const mysql = require("mysql");
// const db = require('C:/Users/connect');
// db.connect();

let file = 'C:/connect.json';
let db_Obj = JSON.parse(fs.readFileSync(file));
console.log(db_Obj);
let db = mysql.createConnection(db_Obj);
// --connect db end--

// --blueBird 讓server可以偽裝成client使用promise
const bluebird = require('bluebird');
bluebird.promisifyAll(db);
// --blueBird end

// --cors 讓不同Domain或port的網站可以向它發request
const cors = require('cors');

// --require end--

//--top level middleware--
// app.use(cors());
// 白名單
const whitelist = ['http://localhost:5000',undefined,'http://localhost:8080','http://localhost:3000'];
// 設定允許接收資料的port
const corsOption = {
    credentials: true,
    origin:function(origin,callback){
        // 參數origin會回傳字串
        // 一定要設callback
        console.log('origin'+ origin);
        if(whitelist.indexOf(origin)>=0){
            callback(null,true);
            // 有在白名單內
        }else{
            // callback(new Error('Not allowed by cors'));
            // 直接建立Error物件/會停server
            callback(null,false);
            // false不允許/不會停server
            // 不允許是指不會設定"Access-Control-Allow-Origin/Access-Control-Allow-Credentials
        }

    }
};
app.use(cors(corsOption));
// 不同server共用同個cookie

// client發req到不同server拿html，但fetch只發port3000，
// cookie會記錄哪個server設定的，放在client，每個port看到的都是同一個cookie

// cookie的值相同會獲得相同的session
// connect.sid=s%3AXyc4dUT_70H-Xv1wosPRGVtbqfmScJaZ.lT9gOrCJ1WZNWIBW3Fl5xeWD02cdkgLCmP9dEj9hlgg
// connect.sid(cookie的名稱)) = cookie的值

app.use(express.static('public'));
// 靜態網頁內容須放在路由設定前
// public 資料夾為所有網頁根目錄

// routes 路由(可定義多個/但要用不同的port)

app.use(bodyParser.urlencoded({ extended: false }));
// 路由設定只要使用get以外的方法就執行bodyParser
// get 資料在header

app.use(bodyParser.json());

app.set("view engine", 'ejs');

app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: 'blowFish',
    cookie: {
        maxAge: 1200000,
    }
}));

//--top level middleware end--

app.get('/', (req, res) => {

    res.render('home', { name: 'BenSon' });
});

app.get('/b.html', (req, res) => {
    res.send("<style>h2{color:red}</style><h2>Hello</h2><br><button>Click</button><script>alert('Hi');</script>");
    // 動態產生b.html 內容
});

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

// -- pic uploads
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
// -- pic uploads end

// --multiple pic uploads
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
// --multiple pic uploads end

// --module require--
const admin1 = require(__dirname + '/admins/admin1');
admin1(app);

const admin2Router = require(__dirname + '/admins/admin2');
app.use(admin2Router);
// 當作middeleware使用

const admin3Router = require(__dirname + '/admins/admin3');
app.use('/admins3', admin3Router);

// --module require end--

// --使用變數代數名稱設定路由
app.get('/my-params1/:action/:id', (req, res) => {
    res.json(req.params);
});

app.get("/my-params2/:action?/:id?", (req, res) => {
    // ?選擇性的可有可無
    res.json(req.params);
});

app.get("/my-params3/*?/*", (req, res) => {
    // *會回傳承索引式
    res.json(req.params);
});

app.get(/^\/09\d{2}\-?\d{3}\-?\d{3}$/, (req, res) => {
    let str = req.url.slice(1);
    str = str.split("?")[0];
    // 用?來切 取得陣列 
    str = str.split("-").join("");
    res.send("手機:" + str);
});

// --使用變數代數名稱設定路由 end

//  --session settings--
app.get('/try_session', (req, res) => {
    req.session.views = req.session.views || 0;
    req.session.views++;
    res.contentType('application/json');
    res.json({
        name: "req.session",
        views: req.session.views
    })
})

//  --session settings end--

app.get("/try-moment", (req, res) => {
    const myFormat = 'YYYY-MM-DD HH:mm:ss';
    const exp = moment(req.session.cookie.expires);
    const mo1 = moment(exp);
    const mo2 = moment(new Date());
    res.contentType('text/plain');
    res.write("台北" + mo1.myFormat + "\n");
    res.write("倫敦" + mo1.tz("Europe/London").format(myFormat) + "\n");
    res.write("東京" + mo2.tz("Asia/Tokyo").format(myFormat) + "\n");
    res.end(JSON.stringify(req.session));
})

// --connect-db Read-- 
app.get("/tryDb_R", (req, res) => {
    const sql = "SELECT * FROM `address_book` LIMIT 10";
    db.query(sql, (error, results, fields) => {
        if (error) throw error;
        console.log(results, fields);
        for (let v of results) {
            v.birthday2 = moment(v.birthday).format('YYYY-MM-DD');
        }
        // 一個個轉換成moment的時間格式,塞到另一個屬性
        // res.json(results);
        res.render("try-db", {
            rows: results
        });
    })
    // res.send('ok');
    // 會先跑，因為跑裡面的callback function 需要時間(只會跑一個/send()/json()/end())
})
// --connect-db Read end-- 

// --connect-db search-- 
app.get("/tryDb_search", (req, res) => {
    const sql = "SELECT * FROM `address_book` WHERE `name` LIKE ?";
    db.query(sql, ['%王小華%'], (error, results, fields) => {
        // results 固定是fetchAll
        if (error) throw error;
        for (let v of results) {
            v.birthday2 = moment(v.birthday).format('YYYY-MM-DD');
        }
        res.render("try-db", {
            rows: results
        });
    })
})
// --connect-db search end-- 

// --connect-db page-- 
app.get("/tryDb2/:page?", (req, res) => {
    let page = req.params.page || 1;
    let perPage = 5;
    const output = {};
    db.queryAsync("SELECT COUNT(1) total FROM address_book WHERE 1")
        .then(results => {
            output.total = results[0].total;
            return db.queryAsync(`SELECT * FROM address_book LIMIT ${(page - 1) * perPage},${perPage}`);
        })
        .then(results => {
            output.rows = results;
            results.forEach(a => {
                a.birthday = moment(a.birthday).format('YYYY-MM-DD');
            });
            res.json(output);
        })
        .catch(error => {
            console.log(error);
        });
})
// --connect-db page end-- 

//  --connect-db test
app.get("/tryDb_ingredient", (req, res) => {
    const sql = "SELECT * FROM `ingredient` WHERE `product_name` LIKE ?";
    db.query(sql, ['%粉'], (error, results, fields) => {
        // results 固定是fetchAll
        if (error) throw error;
        res.json(results);
    })
})

// --connect-db test end

// --connect-db Async query
app.get('try-bluebird', (req, res) => {
    const output = [];
    db.queryAsync("SELECT * FROM address_book WHERE sid=?", [3])
        .then(results => {
            output.push(results[0]);
            return db.queryAsync("SELECT * FROM address_book WHERE sid=?", [2]);
        })
        .then(results => {
            output.push(results[0]);
            res.json(output);
        })
        .catch(error => {
            console.log('*** sql error ***:', error);
        })
})
// --connect-db Async query end

app.get('/try-session2', (req, res) => {
    req.session.views = req.session.views || 0;
    req.session.views++;
    res.json({ views: req.session.views });
})

// 放在所有路由設定後面，沒有設定路由(所有路由都會跑到))，如果上面路由設定沒跑，則跑到這
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

// app2.listen(5000, () => {
//     console.log("server started at port:5000")
// })
