const express = require('express');
const app = express();
const session = require('express-session');
var paginate = require('express-paginate');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:false}))

// 세션모듈의 설정
app.use(session({
    secret: 'a98yhfi&o2u3bn0(rfuw-gvjoiah3@0945u23r#',
    resave: false,
    saveUninitialized: true
}));

//html 템플릿 엔진 ejs 설정
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//업로드 path 추가
app.use('/uploads',express.static('uploads'));

//static path 추가
app.use('/static', express.static('static'));

app.use(async function(req,res,next){
    app.locals.loginTF = req.session.displayName;
    const [rentCount, returnCount] = await Promise.all([
        Rent.count({returnList: false}),
        Rent.count({returnList: true})
    ]);
    app.locals.rentCount = rentCount;
    app.locals.returnCount = returnCount;
    GoodsPage.find().sort({name:1}).exec(function(err, pageData){
        if(err) console.log(err);
        else{
            app.locals.pageData = pageData;
        } 
    }); 
    Category.find().sort({sorting:1}).exec(function(err, categories){
        if(err) console.log(err);
        else{
            //console.log('cate:'+categories);
            app.locals.categoryData = categories;
        } 
    }); 
    next();
})

const mongoose = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');
mongoose.connect(
  "mongodb://localhost:27017/baramdb",
  {useNewUrlParser: true}
);
const db = mongoose.connection;
db.once("open",()=>{
  console.log("Successfully connected to MongoDB using Mongoose!");
});
autoIncrement.initialize(mongoose.connection);
var {Admin, Rent, Goods, GoodsPage, Category} = require('./models/schema');
var path = require('path');
var uploadDir = path.join(__dirname, './uploads'); // 루트의 uploads위치에 저장한다.
var fs = require('fs');

//multer 셋팅
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, callback) { //이미지가 저장되는 도착지 지정
        callback(null, uploadDir);
    },
    filename: function (req, file, callback) { // products-날짜.jpg(png) 저장 
        callback(null, 'products-' + Date.now() + '.' + file.mimetype.split('/')[1]);
    }
});
var upload = multer({ storage: storage });

app.listen(3030, function(){
    console.log('listening on port 3030');
});

// var ip = require("ip");
// const local = ip.address();
// console.log('local:'+local);

app.get('/', paginate.middleware(12, 50),async (req, res)=>{
    const [results, itemCount] = await Promise.all([
        GoodsPage.find().sort({name:1}).limit(req.query.limit).skip(req.skip).exec(),
        GoodsPage.count({})
    ]);
    //console.log('item count:'+itemCount);
    const pageCount = Math.ceil(itemCount / req.query.limit);
    const pages = paginate.getArrayPages(req)(4, pageCount, req.query.page);//슬라이더 개수
    res.render('home', {
        goods: results,
        pages: pages,
        pageCount: pageCount,
    });
});

// 로그인 폼 페이지
app.get('/login', function(req, res){
    res.render('login', {disagree: false});
});

// 로그아웃 처리 - 세션 삭제 후 리다이렉트
app.get('/logout', function(req, res){
    delete req.session.displayName;
    res.redirect('/');
});

// 로그인 처리 - 아이디와 패스워드 비교해서 일치하면 세션에 값을 부여하고 리다이렉트
app.post('/login', function(req, res){
    let user = {
        id:'',
        password:'',
        displayName:'관리자'
    };
    Admin.findOne({}, (err, data) =>{
        if(err){
          console.log(err);
        }
        else{
            user.id = data.loginID;
            user.password = data.loginPW;
            //console.log(data);
            //console.log(user.id + ','+user.password);
            var uname = req.body.id;
            var pwd = req.body.password;
            if(uname === user.id && pwd === user.password){
                req.session.displayName = user.displayName;
                res.redirect('/');
            } else {
                res.render('login',{disagree: true});
            }
        }
    });
});

app.get('/rentList',function(req, res){
    if(req.session.displayName){
        Rent.find({returnList: false}, (err1, rentdata) =>{
            if(err1){
                console.log(err1);
              }
            if(rentdata){
                //console.log(rentdata);
                res.render('rentList', {rentdata: rentdata});
            }
        });
    }
    else{
        res.redirect('/');
    }
});

app.get('/returnList',function(req, res){
    if(req.session.displayName){
        Rent.find({returnList: true}, (err, returndata) =>{
            if(err){
                console.log(err);
            }
            if(returndata){
                //console.log(returndata);
                res.render('returnList', {returndata: returndata});
            }
        });
    }
    else{
        res.redirect('/');
    }
});

app.get('/stockList',async(req, res)=>{
    if(req.session.displayName){
        Goods.find().sort({name:1}).exec(function(err, goodsdata) {
            if(err){
                console.log(err);
            }
            if(goodsdata){
                //console.log(goodsdata);
                res.render('stockList', {goodsdata});
            }
        });
    }
    else{
        res.redirect('/');
    }
});

app.get('/category',async (req, res) => {
    if(req.session.displayName){
        res.render('category', {mode: "list", data: ""});
    }
    else{
        res.redirect('/');
    }
});

app.post('/category/ordering', async(req, res) => {
    const ids = req.body['id[]'];
    //console.log('sortable id:'+ids);
    for(let i = 0; i < ids.length; i++) {
      let id = ids[i];
      const product = await Category.findById(id);
      product.sorting = i;
      await product.save();
    }
    res.redirect('/category');
});

app.get('/category/add',function(req, res){
    if(req.session.displayName){
        res.render('category', {mode:"add", data: ""});                 
    }
    else{
        res.redirect('/');
    }
});

app.post('/category/add', function(req, res){
    if(req.session.displayName){
        //console.log('카테고리 추가');
        //console.log(req.body.categoryname);
        var categoryname = req.body.categoryname;
        new Category({category: categoryname}).save();
        res.redirect('/category');
    }
    else{
        res.redirect('/');
    }
});

app.get('/category/edit/:id',function(req, res){
    //console.log('edit요청:'+req.params.id);
    if(req.session.displayName){
        Category.findOne({'category': req.params.id}, function(err, data){
            if(err) console.log(err);
            else{
                //console.log('edit:'+data);
                res.render('category', {mode:"edit",data: data}); 
            } 
        });
    }
    else{
        res.redirect('/');
    }
});

app.post('/category/edit/:id', function(req, res){
    if(req.session.displayName){
        var Cname = req.body.categoryname;
        //console.log('edit body: ' +req.body.categoryname);
        Category.findOneAndUpdate({category: req.params.id}, {category: Cname}, function(err,data){
            if(err) console.log(err);
            GoodsPage.find({category: data.category}, (err3, goods)=>{
                if(err3) console.log(err3);
                else{
                    goods.forEach(function(item){
                        //console.log('item body: ' +item);
                        GoodsPage.findOneAndUpdate({name: item.name}, {category: Cname}, {new: true},(err2, update)=>{
                            if(err2) console.log(err2);
                            //else console.log(update);
                        });
                    });
                }
                });
            
            //console.log('category update:'+data);
            res.redirect('/category');
        });
    }
    else{
        res.redirect('/');
    }
});

app.get('/category/delete/:id',function(req, res){
    if(req.session.displayName){
        Category.findOneAndRemove({category: req.params.id}, function(err, data){
            //console.log('category delete:', data);
            GoodsPage.find({category: data.category}, (err, goods)=>{
            if(err) console.log(err);
            else{
                goods.forEach(function(item){
                    GoodsPage.findOneAndUpdate({name: item.name}, {category: "기타"}, {new: true},(err2, update)=>{
                        if(err2) console.log(err2);
                        //else console.log(update);
                    });
                });
            }
            });
            res.redirect('/category');
        })
    }
    else{
        res.redirect('/');
    }
});

app.get('/categoryList/:id', paginate.middleware(12, 50), async (req, res)=>{
    var getData = async ()=>{
        //var categories = await GoodsPage.find({'category': req.params.id }).sort({name:1}).exec();
        const [results, itemCount] = await Promise.all([
            GoodsPage.find({'category': req.params.id }).sort({name:1}).limit(req.query.limit).skip(req.skip).exec(),
            GoodsPage.find({'category': req.params.id }).count({})
        ]);
        //console.log('category params:'+req.params.id);//콜백 대신
        const pageCount = Math.ceil(itemCount / req.query.limit);
        const pages = paginate.getArrayPages(req)(4, pageCount, req.query.page);//슬라이더 개수
        return {
            categoryall: results,
            pages: pages,
            pageCount: pageCount,
        };
    };
    getData().then(function (result) {
        res.render('categoryGoods', {
             categoryall: result.categoryall,
              pages: result.pages, 
              pageCount: result.pageCount,
    });
});
})

app.get('/goods', paginate.middleware(10, 50), async (req, res) => {//한 페이지에 보이는 개수
    if(req.session.displayName){
        const [results, itemCount] = await Promise.all([
            GoodsPage.find().sort({name:1}).limit(req.query.limit).skip(req.skip).exec(),
            GoodsPage.count({})
        ]);
        //console.log('item count:'+itemCount);
        const pageCount = Math.ceil(itemCount / req.query.limit);
        const pages = paginate.getArrayPages(req)(4, pageCount, req.query.page);//슬라이더 개수
        res.render('goods', {
            goods: results,
            pages: pages,
            pageCount: pageCount,
        });
    }
    else{
        res.redirect('/');
    }
});

app.get('/goods/add',function(req, res){
    if(req.session.displayName){
        res.render('form', {goods: "", disagree: false});          
    }
    else{
        res.redirect('/');
    }
});

app.post('/goods/add', upload.single('thumbnail'), function(req, res){
    if(req.session.displayName){
        var goodsname = req.body.name;
        var goodscategory = req.body.category;
        var goodsnum = req.body.total;
        var thumbnail = (req.file) ? req.file.filename : "";
        var description = req.body.description;
        Goods.find({name:goodsname},(err,data)=> {
            if(data.length == 0){
                new GoodsPage({name: goodsname, category: goodscategory, total: goodsnum, rent: 0, thumbnail: thumbnail, description: description}).save();
                new Goods({name: goodsname, total: goodsnum, rent: 0}).save();
                res.redirect('/goods');
            }
            else{
                console.log('중복된 이름');
                console.log(Goods.find({name:goodsname}));
                res.render('form', {goods: "", disagree: true});
            }
        })
        
        
        
    }
    else{
        res.redirect('/');
    }
});

app.get('/goods/detail/:id', function(req,res){
    var getData = async ()=>{
        var goods = await GoodsPage.findOne({ 'id': req.params.id }).sort().exec();
        //console.log(goods.id);//콜백 대신
        return {
            goods: goods
        };
    };
    getData().then(function (result) {
        //console.log('!!!!!!detail!!!!!!!');
        //console.log(result);
        //console.log('썸네일:'+result.goods.thumbnail);
        res.render('goodsDetail', { goods: result.goods });
    });
})

app.get('/goods/edit/:id',function(req, res){
    if(req.session.displayName){
        GoodsPage.findOne({'id': req.params.id}, function(err, data){
            if(err) console.log(err);
            else{
                //console.log('edit:'+data);
                res.render('form', {goods: data, disagree: false});
            } 
        });
    }
    else{
        res.redirect('/');
    }
});

app.post('/goods/edit/:id', upload.single('thumbnail'), function(req, res){
    //console.log('req:y:'+req);
    if(req.session.displayName){
        GoodsPage.findOne({id: req.params.id}, function(err, goodspage){
            if(err) console.log(err);
            //console.log('goodspagedata:'+goodspage);
            if(req.file && goodspage.thumbnail){
                fs.unlinkSync(uploadDir+'/'+goodspage.thumbnail);
            }
            var query = {
                name: req.body.name,
                category: req.body.category,
                total: req.body.total,
                thumbnail: (req.file) ? req.file.filename : goodspage.thumbnail,
                description: req.body.description,
            };
            //console.log('query:'+query);
            GoodsPage.findOneAndUpdate({'id': req.params.id}, {$set: query}, function(err2, data){
                if(err2) console.log(err2);
                //console.log('goodspage:'+data);
                Goods.findOneAndUpdate({name: data.name, total: data.total, rent: data.rent}, {name: req.body.name, total: req.body.total}, {new: true}, function(err2,goodsupdate){
                    if(err2) console.log(err2);
                    //console.log('goods:'+goodsupdate);
            });
            res.redirect('/goods/detail/'+req.params.id);
        });
    })   
    }
    else{
        res.redirect('/');
    }
});

app.get('/goods/delete/:id',function(req, res){
    if(req.session.displayName){
        GoodsPage.findOneAndRemove({id: req.params.id}, function(err, data){
            Goods.remove({name: data.name, total: data.total, rent: data.rent}, function(err2){
                if(err2){
                    console.log(err2);
                }
            })
            res.redirect('/goods');
        })
    }
    else{
        res.redirect('/');
    }
});

app.get('/finding', paginate.middleware(12, 50), async (req, res)=>{
    var url = require('url');
    var urlencode = require('urlencode');
    var what = req.url;

    what = urlencode.decode(what);
    console.log('encode:'+what);
    console.log('/finding:'+req.url);
    var key = what.split('?');
    var val = key[1].split('=');
    console.log('q:'+val[1]);
    
    var searchData = async ()=>{
        const [results, itemCount] = await Promise.all([
            GoodsPage.find({$or:[{'name': {$regex: new RegExp(val[1], "i")}},
            {'description': {$regex: new RegExp(val[1], "i")}}]}).sort({name:1}).limit(req.query.limit).skip(req.skip).exec(),
            GoodsPage.find({$or:[{'name': {$regex: new RegExp(val[1], "i")}},
            {'description': {$regex: new RegExp(val[1], "i")}}]}).count({})
        ]);
        console.log('finding:'+results);
        //console.log('category params:'+req.params.id);//콜백 대신
        const pageCount = Math.ceil(itemCount / req.query.limit);
        const pages = paginate.getArrayPages(req)(5, pageCount, req.query.page);//슬라이더 개수
        return {
            searchall: results,
            pages: pages,
            pageCount: pageCount,
        };
    };
    searchData().then(function (result) {
        res.render('searchGoods', {
            searchall: result.searchall,
            pages: result.pages, 
            pageCount: result.pageCount,
    });
    })
})


app.get('/confirmReturn/:id',function(req, res){
    const index = req.params.id;
    //console.log('index:'+index);
    if(req.session.displayName){
        Rent.find({returnList : true}, function(err1, returndata){
            if(err1) console.log(err1);
            //console.log('반납승인웹:'+returndata);
            Goods.findOne({name: returndata[index].goodsname}, (err2, goodsdata) =>{
                if(err2){
                    console.log(err2);
                }
                else{
                    if((goodsdata == null)){
                        reply = '일치하는 상품이 없습니다.'
                        //console.log(reply);
                    }
                    else{
                        var returnnum = Number(goodsdata.rent)-Number(returndata[index].quantity);
                        Goods.findOneAndUpdate({name: returndata[index].goodsname},{rent: returnnum}, {new: true}, (err, updatedata) =>{
                          if(err) console.log(err);
                          else console.log(updatedata);
                        })
                        GoodsPage.findOneAndUpdate({name: returndata[index].goodsname},{rent: returnnum}, {new: true}, (err, updatedata) =>{
                          if(err) console.log(err);
                          else console.log(updatedata);
                        })                        
                        Rent.findOneAndDelete({goodsname: returndata[index].goodsname, quantity: returndata[index].quantity, returnList: true}, (err, deleteddata) =>{
                          if(err) console.log(err);
                          else console.log(deleteddata);
                        })
                  }  
              }                        
          })
        })
        res.redirect('/returnList');
    }
    else{
        res.redirect('/');
    }
});

app.get('/deleteRent/:id',function(req, res){
    const index = req.params.id;
    //console.log('index:'+index);
    if(req.session.displayName){
        Rent.find({returnList : false}, function(err1, rentdata){
            if(err1) console.log(err1);
            //console.log('반납승인웹:'+rentdata);
            Goods.findOne({name: rentdata[index].goodsname}, (err2, goodsdata) =>{
                if(err2){
                    console.log(err2);
                }
                else{
                    if((goodsdata == null)){
                        reply = '일치하는 상품이 없습니다.'
                        console.log(reply);
                    }
                    else{
                        var returnnum = Number(goodsdata.rent)-Number(rentdata[index].quantity);
                        Goods.findOneAndUpdate({name: rentdata[index].goodsname},{rent: returnnum}, {new: true}, (err, updatedata) =>{
                          if(err) console.log(err);
                          else console.log(updatedata);
                        })
                        GoodsPage.findOneAndUpdate({name: rentdata[index].goodsname},{rent: returnnum}, {new: true}, (err, updatedata) =>{
                          if(err) console.log(err);
                          else console.log(updatedata);
                        })                        
                        Rent.findOneAndDelete({goodsname: rentdata[index].goodsname, quantity: rentdata[index].quantity, returnList: false}, (err, deleteddata) =>{
                          if(err) console.log(err);
                          else console.log(deleteddata);
                        })
                  }  
              }                        
          })
        })
        res.redirect('/rentList');
    }
    else{
        res.redirect('/');
    }
});

//summernote editor
app.post('/products/ajax_summernote',upload.single('thumbnail'),function(req,res){
    res.send('/uploads/'+req.file.filename);
});