var express = require('express');

// 세션용 모듈
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({extended:false}))


// 세션모듈의 설정
app.use(session({
    secret: 'a98yhfi&o2u3bn0(rfuw-gvjoiah3@0945u23r#',
    resave: false,
    saveUninitialized: true
}));

app.get('/count', function(req, res){
    if(req.session.count){
        req.session.count++;    
    }
    else{
        req.session.count = 1;
    }
    res.send('count : ' + req.session.count);
});

app.get('/home', function(req, res){
    res.send('count : ' + req.session.count);
});
// res.sendFile(__dirname + '/html/index.html')
// 사용자 페이지, 세션값 유무에 따라서 다른 메세지를 표시

app.get('/login', function(req, res){
    if(req.session.displayName){
        res.send(`
            <h2>Hello, ${req.session.displayName} </h2>
            <a href="/auth/logout">logout</a>
        `);
    } else {
        res.send(`
            <h2>Please login..</h2>
            <a href="/auth/login">login</a>
        `);
    }
});

// 로그인 폼 페이지
app.get('/auth/login', function(req, res){
    var output = `
    <h1>Login</h1>
    <form action="/auth/login" method="post" >
        <p>
            <input type="text" name="username" placeholder="username" />
        </p>
        <p>
            <input type="password" name="password" placeholder="password" />
        </p>
            <input type="submit" />
    </form>
    `;
    res.send(output);
});

// 로그아웃 처리 - 세션 삭제 후 리다이렉트
app.get('/auth/logout', function(req, res){
    delete req.session.displayName;
    res.redirect('/welcome');
});

// 로그인 처리 - 아이디와 패스워드 비교해서 일치하면 세션에 값을 부여하고 리다이렉트
app.post('/auth/login', function(req, res){
    var user = {
        username:'hjannie',
        password:'123456',
        displayName:'annie'
    };
    var uname = req.body.username;
    var pwd = req.body.password;
    if(uname === user.username && pwd === user.password){
        req.session.displayName = user.displayName;
        res.redirect('/welcome');
    } else {
        res.send('Who are you? <a href="/auth/login">login</a>');
    }
    res.send(uname);
});

app.listen(3003, function(){
    console.log('Connected 3003 port!!!');
});