const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const apiRouter = express.Router()

app.use(bodyParser.json())
app.use('/api',apiRouter)

var ip = require("ip");
const local = ip.address();
//var homepage = 'http://'+local+':3030/';
//var homepage = 'http://3.34.126.150:3030/';
var homepage = 'http://'+local+':3030/';
console.log('local:'+local);
console.log('homepage link:'+homepage);
console.log('skill link:'+'http://'+local+':3003/');

const mongoose = require("mongoose");
mongoose.connect(
  "mongodb://localhost:27017/baramdb",
  {useNewUrlParser: true}
);
const db = mongoose.connection;
db.once("open",()=>{
  console.log("Successfully connected to MongoDB using Mongoose!");
});
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);

var {User, GoodsPage} = require('./models/schema')
var {Admin} = require('./models/schema')
var {Goods} = require('./models/schema')
var {Rent} = require('./models/schema')
var {Wait} = require('./models/schema')

//new Admin().save(); //관리자 처음 등록
////관리자 인증 id삭제
// Admin.findOneAndUpdate({},{kakaoid: ''}, {new: true}, (err, data)=>{
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log(data);
//   }
// })

// new Goods({name: "IMU", total: 10, rent: 0}).save();
// new Goods({name: "라즈베리파이", total: 20, rent: 0}).save();
// new Goods({name: "psd", total: 100, rent: 0}).save();

// //rent정보 삭제
// Rent.deleteMany({}, (err,data)=>{
//     if(err){
//       console.log(err);
//     }
//     else{
//       console.log(data);
//     }});

// //user정보 삭제
// User.deleteMany({}, (err,data)=>{
//     if(err){
//       console.log(err);
//     }
//     else{
//       console.log(data);
//     }});

// // 상품 rent 0으로 초기화
// Goods.find({}, (err, data) =>{
//   if(err){
//     console.log(err);
//   }
//   else{
//     for(var i=0; i<data.length; i++){
//       Goods.findOneAndUpdate({name: data[i].name}, {rent: 0}, {new: true}, (err2, updatedata) =>{
//         if(err){
//           console.log(err2);
//         }
//         else{
//           console.log(updatedata);
//         }
//       })
//     }
//   }
// })

apiRouter.post('/info/checkAdmin',function(req,res){
    console.log(req.body.action);
    const code =  req.body.action.params.adminCode;
    var reply = '';
    Admin.findOne({}, (err, data) =>{
        if(err){
          console.log(err);
        }
        else{
            if (code == data.code){
                console.log("관리자 인증 번호 : " + data.code + " 입력 : " + code);
                Admin.findOneAndUpdate({code: data.code}, {kakaoid: req.body.userRequest.user.id}, {new: true}, (err, updatedata) =>{
                    if(err){
                      console.log(err);
                    }
                    else{
                      console.log(updatedata);
                    }
                  })
                reply = '관리자 인증에 성공하였습니다.'
            }
            else {
                console.log("관리자 인증 번호 : " + data.code + " 입력 : " + code);
                reply = '관리자 번호가 일치하지 않습니다.'
            }
            const responseBody = {
                  version: "2.0",
                  template: {
                    outputs: [
                      {
                        simpleText: {
                          text: reply
                        }
                      }
                    ]
                  }
                };
            res.send(responseBody);
        }
      })
  })

apiRouter.post('/info/createUser',function(req,res){
    console.log(req.body.action);
    const userid = req.body.userRequest.user.id;
    const username =  req.body.action.params.sys_person_name;
    const detailname = req.body.action.detailParams.sys_person_name.origin;
    var reply = '';
    User.findOne({kakaoid: userid}, (err, data) =>{
        if(err){
          console.log(err);
        }
        else{
            if(data == null){
                console.log('새로운 사용자입니다.');
                new User({ kakaoid: userid, name: username, detailname: detailname}).save();
                console.log(username+' 사용자를 등록했습니다.');
                reply = username + ' 사용자를 등록했습니다.';
            }
            else{
                console.log('이미 등록된 사용자입니다.');
                console.log(data.kakaoid);
                console.log(data.name);
                reply = data.name + ' 이미 등록된 사용자입니다.';
            }
            const responseBody = {
                version: "2.0",
                template: {
                  outputs: [
                    {
                      simpleText: {
                        text: reply
                      }
                    }
                  ]
                }
              };
              res.send(responseBody);
        }
      })
  })

apiRouter.post('/info/changeName',function(req,res){
    console.log(req.body.action);
    const userid = req.body.userRequest.user.id;
    const username =  req.body.action.params.sys_person_name;
    const detailname = req.body.action.detailParams.sys_person_name.origin;
    var reply = '';
    User.findOne({kakaoid: userid}, (err, data) =>{
        if(err){
          console.log(err);
        }
        else{
            if(data == null){
                console.log('새로운 사용자입니다.');
                new User({ kakaoid: userid, name: username, detailname: detailname}).save();
                console.log(username+' 사용자를 등록했습니다.');
                reply = username + ' 사용자를 등록했습니다.';
                const responseBody = {
                    version: "2.0",
                    template: {
                      outputs: [
                        {
                          simpleText: {
                            text: reply
                          }
                        }
                      ]
                    }
                  };
                res.send(responseBody);
            }
            else{
                User.findOneAndUpdate({kakaoid: userid}, {name: username, detailname: detailname}, {new: true}, (err, updatedata) =>{
                    if(err){
                      console.log(err);
                    }
                    else{
                        console.log(updatedata);
                        reply = '사용자 이름을 '+username+'('+detailname+')'+'으로 변경했습니다.';
                        const responseBody = {
                            version: "2.0",
                            template: {
                              outputs: [
                                {
                                  simpleText: {
                                    text: reply
                                  }
                                }
                              ]
                            }
                          };
                        res.send(responseBody);
                    }
                });
            }
        }
      })
  })

apiRouter.post('/user/rent',function(req,res){
    console.log(req.body.action);
    const userid = req.body.userRequest.user.id;
    const goodsname =  req.body.action.params.goods_name;
    var goodsnum =  req.body.action.params.goods_num;
    goodsnum = goodsnum.replace(/[^0-9]/g,'');
    console.log('goodsnum:'+goodsnum);
    var foundusername = '';
    User.findOne({kakaoid: userid}, (err, data) =>{
        if(err){
          console.log(err);
        }
        else{
            if(data == null){
                console.log(data);
                const responseBody = {
                    version: "2.0",
                    template: {
                        outputs: [
                            {
                                "basicCard": {
                                  "title": '등록된 사용자가 아닙니다.\n먼저 사용자 등록을 한 후 다시 대여신청을 해주세요.',
                                  "buttons": [
                                    {
                                      "action": "block",
                                      "label": "사용자 등록",
                                      "blockid": "5f92d71f611a1b10707aa95d"
                                    }
                                  ]
                                }
                              }
                        ]
                    }
                };
            res.send(responseBody);
            }
            else{
                foundusername = data.name;
                Goods.findOne({name: goodsname}, (err, goodsdata) =>{
                    if(err){
                      console.log(err);
                    }
                    else{
                        if(goodsdata == null){
                            console.log(goodsdata);
                            var reply = goodsname + '는 없는 물품입니다.\n물품명을 확인하고 다시 입력해주세요.'
                            const responseBody = {
                                version: "2.0",
                                template: {
                                    outputs: [
                                        {
                                            "basicCard": {
                                              "title": reply,
                                              "description": "아래 버튼을 눌러 물품을 찾아보세요.",
                                              "buttons": [
                                                {
                                                  "action":  "webLink",
                                                  "label": "물품 찾아보기",
                                                  "webLinkUrl": homepage
                                                }
                                              ]
                                            }
                                          }
                                    ]
                                }
                            };
                        res.send(responseBody);
                        }
                        else{
                            var stock = goodsdata.total - goodsdata.rent;
                            console.log(goodsname+ " 재고는 "+ stock +"개 입니다.");
                            if( stock >= goodsnum){
                                var totalrent = Number(goodsnum)+Number(goodsdata.rent);
                                new Rent({ kakaoid: userid, username: data.detailname, goodsname: goodsname, quantity: goodsnum}).save();
                                var reply = data.name+ '회원님 '+ goodsname+' '+goodsnum+'개 대여 신청 완료되었습니다.\n개방에 와서 물품을 받아가세요~';
                                Goods.findOneAndUpdate({name: goodsname}, {rent: totalrent}, {new: true}, (err, updatedata) =>{
                                    if(err){
                                      console.log(err);
                                    }
                                    else{
                                      console.log(updatedata);
                                    }
                                  })
                                GoodsPage.findOneAndUpdate({name: goodsname}, {rent: totalrent}, {new: true}, (err, updatedata) =>{
                                  if(err){
                                    console.log(err);
                                  }
                                  else{
                                    console.log(updatedata);
                                  }
                                })
                                console.log(reply);
                                const responseBody = {
                                    version: "2.0",
                                    template: {
                                        outputs: [
                                        {
                                            simpleText: {
                                            text: reply
                                            }
                                        }
                                        ]
                                    }
                                };
                                res.send(responseBody);
                            }
                            else if((goodsnum <= goodsdata.total)&&(goodsnum > stock)){
                                reply = '물품의 재고가 부족합니다.\n'+ goodsname+'는 '+stock+'개 남았습니다.\n';
                                var reply2 = '대기명단에 추가를 원하시면 대기 버튼을, 대여를 취소하시려면 대여 취소 버튼을 누르세요.';
                                const responseBody = {
                                    "version": "2.0",
                                    "template": {
                                    "outputs": [
                                        {
                                        "basicCard": {
                                            "title": reply,
                                            "description": reply2,
                                            "buttons": [
                                            {
                                                "action": "message",
                                                "label": "대기할래요~",
                                                "messageText": "물품 대기 신청"
                                            },
                                            {
                                                "action": "message",
                                                "label": "대여 취소할래요~",
                                                "messageText": "물품 대여 취소"
                                            }
                                            ]
                                        }
                                        }
                                    ]
                                    }
                                };
                                res.send(responseBody);
                            }
                            else{
                                reply = goodsname + '의 총 보유 갯수는 '+ goodsdata.total+'개 입니다.\n'
                                reply += '총 보유 갯수보다 적은 갯수로 대여신청 해주세요.'
                                const responseBody = {
                                    version: "2.0",
                                    template: {
                                        outputs: [
                                        {
                                            simpleText: {
                                            text: reply
                                            }
                                        }
                                        ]
                                    }
                                };
                                res.send(responseBody);
                            } 
                        }
                    }
                });    
            }
        }
    });    
  })

apiRouter.post('user/rent/waiting',function(req,res){
    console.log(req.body.action);
    const userid = req.body.userRequest.user.id;
    const goodsname =  req.body.action.params.goods_name;
    var goodsnum =  req.body.action.params.goods_num;
    goodsnum = goodsnum.replace(/[^0-9]/g,'');
    console.log('goodsnum:'+goodsnum);
    var foundusername = '';
    User.findOne({kakaoid: userid}, (err, userdata) =>{
        if(err){
          console.log(err);
        }
        else{
            if(userdata == null){
                console.log(userdata);
                const responseBody = {
                    version: "2.0",
                    template: {
                        outputs: [
                            {
                                "basicCard": {
                                  "title": '등록된 사용자가 아닙니다.\n먼저 사용자 등록을 해주세요.',
                                  "buttons": [
                                    {
                                      "action": "block",
                                      "label": "사용자 등록",
                                      "blockid": "5f92d71f611a1b10707aa95d"
                                    }
                                  ]
                                }
                              }
                        ]
                    }
                };
            res.send(responseBody);
            }
            else{
                foundusername = userdata.name;
                Goods.findOne({name: goodsname}, (err, goodsdata) =>{
                    if(err){
                      console.log(err);
                    }
                    else{
                        if(goodsdata == null){
                            console.log(goodsdata);
                            var reply = goodsname + '는 없는 물품입니다.\n물품명을 확인하고 다시 입력해주세요.'
                            const responseBody = {
                                version: "2.0",
                                template: {
                                    outputs: [
                                        {
                                            "basicCard": {
                                              "title": reply,
                                              "description": "아래 버튼을 눌러 물품을 찾아보세요.",
                                              "buttons": [
                                                {
                                                  "action":  "webLink",
                                                  "label": "물품 찾아보기",
                                                  "webLinkUrl": homepage
                                                }
                                              ]
                                            }
                                          }
                                    ]
                                }
                            };
                        res.send(responseBody);
                        }
                        else{
                            var stock = goodsdata.total - goodsdata.rent;
                            console.log(goodsname+ " 재고는 "+ stock +"개 입니다.");
                            if( stock >= goodsnum){
                                var totalrent = Number(goodsnum)+Number(goodsdata.rent);
                                new Rent({ kakaoid: userid, username: data.detailname, goodsname: goodsname, quantity: goodsnum}).save();
                                var reply = goodsname+' '+goodsnum+'개 대여 신청이 완료되었습니다.';
                                Goods.findOneAndUpdate({name: goodsname}, {rent: totalrent}, {new: true}, (err, updatedata) =>{
                                    if(err){
                                      console.log(err);
                                    }
                                    else{
                                      console.log(updatedata);
                                    }
                                  })
                                console.log(reply);
                                const responseBody = {
                                    version: "2.0",
                                    template: {
                                        outputs: [
                                        {
                                            simpleText: {
                                            text: reply
                                            }
                                        }
                                        ]
                                    }
                                };
                                res.send(responseBody);
                            }
                            else{
                                reply = goodsname+' '+goodsnum+'개 대기 신청되었습니다.\n';
                                new Wait({kakaoid: userid, username: foundusername, goodsname: goodsname, quantity: goodsnum}).save();
                                const responseBody = {
                                    version: "2.0",
                                    template: {
                                        outputs: [
                                        {
                                            simpleText: {
                                            text: reply
                                            }
                                        }
                                        ]
                                    }
                                };
                                res.send(responseBody);
                            } 
                        }
                    }
                });    
            }
        }
    });    
  })

apiRouter.post('/user/return/rentList',function(req,res){
    const userid = req.body.userRequest.user.id;
    var reply = '';
    let quickreturn = [];
    Rent.find({kakaoid: userid, returnList : false}, (err, data) =>{
        if(err){
          console.log(err);
        }
        else{
            if((data == null)|(data.length == 0)){
                reply = '대여 기록이 없습니다.';
            }
            else{
                reply = '대여 목록입니다.\n';
                for (var i = 0; i< data.length; i++ ){
                    var rentdate = data[i].rentdate.split(' ');
                    reply += (i+1)+') '+data[i].goodsname + ' '+ data[i].quantity+'개' + ' ('+ rentdate[0] + ')\n';
                    quickreturn.push({ 'label': (i+1), 'action': 'message', 'messageText': (i+1)+'번 반납 신청'});
                }
                reply += '반납할 물품 번호를 선택하세요.'
            }
            console.log(reply);
            const responseBody = {
                version: "2.0",
                template: {
                  outputs: [
                    {
                      simpleText: {
                        text: reply
                      }
                    }
                  ],
                  quickReplies: quickreturn
                }
              };
              res.send(responseBody);
        }
      })
  })

apiRouter.post('/user/return/returnFinish',function(req,res){
    const userid = req.body.userRequest.user.id;
    var text = req.body.userRequest.utterance;
    var number = Number(text.replace(/[^0-9]/g,''));
    var reply = '';
    Rent.find({kakaoid: userid, returnList : false}, (err, rentdata) =>{
        if(err){
          console.log(err);
        }
        else{
            if((rentdata == null)|(rentdata.length == 0)){
                reply = '대여 기록이 없습니다.';
            }
            else{
                reply = rentdata[number-1].goodsname + ' '+ rentdata[number-1].quantity+'개를 반납 신청했습니다.\n';
                Rent.findOneAndUpdate({kakaoid: userid, goodsname: rentdata[number-1].goodsname, quantity: rentdata[number-1].quantity, rentdate: rentdata[number-1].rentdate},{returnList: true}, {new: true}, (err, updatedata) =>{
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log(updatedata);
                    }
                })
            }
            const responseBody = {
                version: "2.0",
                template: {
                  outputs: [
                    {
                      simpleText: {
                        text: reply
                      }
                    }
                  ]
                }
              };
            res.send(responseBody);
            console.log(reply);
        }
      })
  })

apiRouter.post('/admin/rentList',function(req,res){
    const userid = req.body.userRequest.user.id;
    var reply = '';
    var reply2 = '';
    var reply3 = '';
    var responseBody = '';
    Admin.findOne({}, (err, data) =>{
        if(err){
          console.log(err);
        }
        else{
            if (userid == data.kakaoid){
                Rent.find({returnList: false}, (err, rentdata) =>{
                    if(err){
                      console.log(err);
                    }
                    else{
                        if((rentdata == null)|(rentdata.length == 0)){
                            reply = '대여 기록이 없습니다.';
                        }
                        else{
                            reply = '대여 목록입니다.\n';
                            for (var i = 0; i< rentdata.length; i++ ){
                                var rentdate = rentdata[i].rentdate.split(' ');
                                  reply += (i+1)+') ' + rentdata[i].username + ' : '+rentdata[i].goodsname + ' '+ rentdata[i].quantity+'개' + ' ('+ rentdate[0] + ')\n';                                                                 
                            }
                        }
                        console.log(reply);
                        const responseBody = {
                            version: "2.0",
                            template: {
                              "outputs": [
                              {
                                simpleText: {
                                  text: reply
                              }
                            }
                        ]
                      }
                          };
                          res.send(responseBody);
                    }
                })
            }
            else {
                reply = '관리자 권한이 없습니다.'
                responseBody = { //사용자 메뉴
                    "version": "2.0",
                    "template": {
                      "outputs": [
                            {
                              simpleText: {
                                text: reply
                            }
                          }
                      ]
                    }
                  };
                res.send(responseBody);
            }
        }
      })
  })

apiRouter.post('/admin/returnList',function(req,res){
    const userid = req.body.userRequest.user.id;
    var reply = '';
    var responseBody = '';
    let quickreturn = [];
    Admin.findOne({}, (err, data) =>{
        if(err){
          console.log(err);
        }
        else{
            if (userid == data.kakaoid){
                Rent.find({returnList : true}, (err, returndata) =>{
                    if(err){
                      console.log(err);
                    }
                    else{
                        if((returndata == null)|(returndata.length == 0)){
                            reply = '반납 신청이 없습니다.';
                        }
                        else{
                            reply = '반납 신청 목록입니다.\n';
                            for (var i = 0; i< returndata.length; i++ ){
                                var rentdate = returndata[i].rentdate.split(' ');
                                reply += (i+1)+') ' + returndata[i].username + ' : '+returndata[i].goodsname + ' '+ returndata[i].quantity+'개' + ' ('+ rentdate[0] + ')\n';
                                quickreturn.push({ 'label': (i+1), 'action': 'message', 'messageText': (i+1)+'번 반납 승인 처리'});
                            }
                            reply += '반납 완료된 번호를 선택하세요.'
                        }
                        console.log(reply);
                        const responseBody = {
                            version: "2.0",
                            template: {
                              outputs: [
                                {
                                  simpleText: {
                                    text: reply
                                  }
                                }
                              ],
                              quickReplies: quickreturn
                            }
                          };
                          res.send(responseBody);
                    }
                })
            }
            else {
                reply = '관리자 권한이 없습니다.'
                responseBody = { //사용자 메뉴
                    "version": "2.0",
                    "template": {
                      "outputs": [
                            {
                              simpleText: {
                                text: reply
                            }
                          }
                      ]
                    }
                  };
                res.send(responseBody);
            }
        }
      })
  })

apiRouter.post('/admin/returnConfirm',function(req,res){
    console.log('반납승인스킬');
    const userid = req.body.userRequest.user.id;
    var text = req.body.userRequest.utterance;
    var number = Number(text.replace(/[^0-9]/g,''));
    var reply = '';
    var responseBody = '';
    Admin.findOne({}, (err, data) =>{
        if(err){
          console.log(err);
        }
        else{
            if (userid == data.kakaoid){
                Rent.find({returnList : true}, (err2, returndata) =>{
                    if(err){
                      console.log(err2);
                    }
                    else{
                        if((returndata == null)|(returndata.length == 0)){
                            reply = '반납 신청이 없습니다.';
                        }
                        else{
                            console.log('returndata:'+returndata[number-1]);
                            reply += number +'번째 반납 신청을 처리했습니다.';
                            console.log('상품이름:'+returndata[number-1].goodsname);
                            Goods.findOne({name: returndata[number-1].goodsname}, (err, goodsdata) =>{
                                if(err){
                                    console.log(err);
                                }
                                else{
                                    if((goodsdata == null)){
                                        reply = '일치하는 상품이 없습니다.'
                                        console.log(reply);
                                    }
                                    else{
                                        var returnnum = Number(goodsdata.rent)-Number(returndata[number-1].quantity);
                                        Goods.findOneAndUpdate({name: returndata[number-1].goodsname},{rent: returnnum}, {new: true}, (err, updatedata) =>{
                                          if(err){
                                              console.log(err);
                                          }
                                          else{
                                              console.log(updatedata);
                                          }
                                        })
                                        GoodsPage.findOneAndUpdate({name: returndata[number-1].goodsname},{rent: returnnum}, {new: true}, (err, updatedata) =>{
                                          if(err){
                                              console.log(err);
                                          }
                                          else{
                                              console.log(updatedata);
                                          }
                                        })
                                        
                                        Rent.findOneAndDelete({goodsname: returndata[number-1].goodsname, quantity: returndata[number-1].quantity, returnList: true}, (err, deleteddata) =>{
                                          if(err){
                                              console.log(err);
                                          }
                                          else{
                                              console.log(deleteddata);
                                          }
                                        })
                                  }  
                              }                        
                          })
                    }
                    console.log(reply);
                    const responseBody = {
                        version: "2.0",
                        template: {
                            outputs: [
                            {
                                simpleText: {
                                text: reply
                                }
                            }
                            ]
                        }
                        };
                    res.send(responseBody);
                      }
                })
                
            }
            else {
                reply = '관리자 권한이 없습니다.'
                responseBody = { //사용자 메뉴
                    "version": "2.0",
                    "template": {
                      "outputs": [
                            {
                              simpleText: {
                                text: reply
                            }
                          }
                      ]
                    }
                  };
                res.send(responseBody);
            }
        }
      })
  })

apiRouter.post('/admin/waitingList',function(req,res){
    const userid = req.body.userRequest.user.id;
    var reply = '';
    var responseBody = '';
    Admin.findOne({}, (err, data) =>{
        if(err){
          console.log(err);
        }
        else{
            if (userid == data.kakaoid){
                Rent.find({returnList: false}, (err, rentdata) =>{
                    if(err){
                      console.log(err);
                    }
                    else{
                        if((rentdata == null)|(rentdata.length == 0)){
                            reply = '대여 기록이 없습니다.';
                        }
                        else{
                            reply = '대여 목록입니다.\n';
                            for (var i = 0; i< rentdata.length; i++ ){
                                var rentdate = rentdata[i].rentdate.split(' ');
                                reply += (i+1)+') ' + rentdata[i].username + ' : '+rentdata[i].goodsname + ' '+ rentdata[i].quantity+'개' + ' ('+ rentdate[0] + ')\n';
                            }
                        }
                        console.log(reply);
                        const responseBody = {
                            version: "2.0",
                            template: {
                              outputs: [
                                {
                                  simpleText: {
                                    text: reply
                                  }
                                }
                              ]
                            }
                          };
                          res.send(responseBody);
                    }
                })
            }
            else {
                reply = '관리자 권한이 없습니다.'
                responseBody = { //사용자 메뉴
                    "version": "2.0",
                    "template": {
                      "outputs": [
                            {
                              simpleText: {
                                text: reply
                            }
                          }
                      ]
                    }
                  };
                res.send(responseBody);
            }
        }
      })
  })

apiRouter.post('/admin/stockList',function(req,res){ 
    const userid = req.body.userRequest.user.id;
    var reply = '';
    var responseBody = '';
    Admin.findOne({}, (err, data) =>{
        if(err){
          console.log(err);
        }
        else{
            if (userid == data.kakaoid){
                Goods.find({}, (err, goodsdata) =>{
                    if(err){
                      console.log(err);
                    }
                    else{
                        if((goodsdata == null)|(goodsdata.length == 0)){
                            reply = '등록된 물품이 없습니다.';
                        }
                        else{
                            reply = '물품 현황입니다.\n';
                            for (var i = 0; i< goodsdata.length; i++ ){
                                reply += (i+1)+') ' + goodsdata[i].name + ': '+goodsdata[i].rent + '/'+ goodsdata[i].total+'\n';
                            }
                        }
                        console.log(reply);
                        const responseBody = {
                            version: "2.0",
                            template: {
                              outputs: [
                                {
                                  simpleText: {
                                    text: reply
                                  }
                                }
                              ]
                            }
                          };
                          res.send(responseBody);
                    }
                })
            }
            else {
                reply = '관리자 권한이 없습니다.'
                responseBody = { //사용자 메뉴
                    "version": "2.0",
                    "template": {
                      "outputs": [
                            {
                              simpleText: {
                                text: reply
                            }
                          }
                      ]
                    }
                  };
                res.send(responseBody);
            }
        }
      })
  })

apiRouter.post('/fallback',function(req,res){
    var userid = req.body.userRequest.user.id;
    var responseBody;
    Admin.findOne({}, (err, data) =>{
        if(err){
          console.log(err);
        }
        else{
            if (userid == data.kakaoid){
                responseBody = { //관리자 메뉴
                    "version": "2.0",
                    "template": {
                      "outputs": [
                        {
                          "basicCard": {
                            "title": "다음 중 원하는 기능을 선택하세요.",
                            //"description": "다음 중 원하는 기능을 선택하세요.",
                            "buttons": [
                              {
                                "action": "message",
                                "label": "대여 목록 확인",
                                "messageText": "대여 목록 확인"
                              },
                              {
                                "action": "message",
                                "label": "반납 요청 확인",
                                "messageText": "반납 요청 확인"
                              },
                              {
                                "action":  "message",
                                "label": "물품 재고 확인",
                                "messageText": "물품 재고 확인"                                
                              }
                            ]
                          }
                        }
                      ]
                    }
                  };
            }
            else {
                responseBody = { //사용자 메뉴
                    "version": "2.0",
                    "template": {
                      "outputs": [
                        {
                          "basicCard": {
                            "title": "다음 중 원하는 기능을 선택하세요.",
                            //"description": "다음 중 원하는 기능을 선택하세요.",
                            "buttons": [
                              {
                                "action": "message",
                                "label": "대여할래요~",
                                "messageText": "대여 신청"
                              },
                              {
                                "action": "message",
                                "label": "반납할래요~",
                                "messageText": "반납 신청"
                              },
                              {                          
                                "action":  "webLink",
                                "label": "어떤 물품이 있나요??",
                                "webLinkUrl": homepage
                              }
                            ]
                          }
                        }
                      ]
                    }
                  };
            }
            res.send(responseBody);
        }
      })
  })

app.post("/blockId", function(req, res) {
    const userRequest = req.body.userRequest;
    const blockId = userRequest.block.id;
    return res.send({
      version: "2.0",
      template: {
        outputs: [
          {
            basicCard: {
              title: "블록ID 입니다",
              description: blockId
            }
          }
        ]
      }
    });
  });

app.listen(3003,function(){
    console.log('listening on port 3003')
  });