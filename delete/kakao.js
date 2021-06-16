const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const apiRouter = express.Router()

app.use(bodyParser.json())
app.use('/api',apiRouter)

apiRouter.post('',function(req,res){
  const responseBody = {
        version: "2.0",
        template: {
          outputs: [
            {
              simpleText: {
                text: "hello I'm Ryan"
              }
            }
          ]
        }
      };
    
      res.send(responseBody);
})


const mongoose = require("mongoose");
mongoose.connect(
  "mongodb://localhost:27017/baramdb",
  {useNewUrlParser: true}
);
const db = mongoose.connection;
db.once("open",()=>{
  console.log("Successfully connected to MongoDB using Mongoose!");
});

var {User} = require('./models/schema')
var {Goods} = require('./models/schema')
var {Rent} = require('./models/schema')

// var p1 = new User({
//   kakaoid : 991229,
//   name : "이혜진",
//   studentid : 2018741072
// })
// var g1 = new Goods({
//   name : "IMU",
//   goodsid : 1234,
//   total : 4,
//   rent : 0
// })
// var r1 = new Rent({
//   kakaoid : 991229,
//   goodsid: 1234,
//   quantity : 1
// })
// if(r1.kakaoid == p1.kakaoid){
//   if(r1.goodsid == g1.goodsid){
//     if(r1.quantity <= (g1.total-g1.rent)){
//       console.log(r1.rentdate+" : "+p1.name+"님이 "+g1.name+"를 "+r1.quantity+"개 대여했습니다.\n");
//     }else console.log("quantity error");} else console.log("goods error");}else console.log("kakao id error");
// p1.save();
// r1.save();
// g1.save();

function findData(database,field, find_data){
    //원하는 데이터 베이스에서 찾고싶은 필드명:데이터명 입력
    //ex) findData(Goods,name,IMU)
    //안에 if문 세개 만들어서 database구분
    //그 안에 if문 만들어서 field구분
    //find_data는 형변환(String or Number)해서 넣기
}
function updataData(database, field, new_data){

}
function deleteData(database, field, remove_data){

}
Rent.deleteMany({ kakaoid : 991229}, (err,data)=>{
  if(err){
    console.log(err);
  }
  else{
    console.log(data);
  }});

apiRouter.post('/add',function(req,res){
  var text = req.body.userRequest.utterance;
  var data = text.split(' ');
  new Goods({ name : data[0],  goodsid : data[1],  total : data[2],  rent : data[3]}).save();
  var textto = "name:"+data[0]+",goodsid:"+data[1]+",total:"+data[2]+",rent:"+data[3];
  const responseBody = {
        version: "2.0",
        template: {
          outputs: [
            {
              simpleText: {
                text: textto
              }
            }
          ]
        }
      };
      res.send(responseBody);
})

apiRouter.post('/minus',function(req,res){
  var text = req.body.userRequest.utterance;
  var new_data = text.split(' ');
  // text = 물품이름, 수량
  const goodsname = new_data[0];


  var rentnum = Goods.findOne({name: String(new_data[0])}, (err, data) =>{
    if(err){
      console.log(err);
    }
    else{
      //console.log(data);
      //rentnum = Number(new_data[1])+Number(data.rent);
      //console.log("rent_new:"+new_data[1]+" rent:"+rentnum);
      return data;
    }
  })
  console.log('rentnum:'+rentnum.rent);
  //var num = rentnum({rent: {$elemMatch}});
  //console.log('rnum: '+rnum);
  //console.log("after rentnum:"+rentnum);
  Goods.findOneAndUpdate({name: String(new_data[0])}, {rent: new_data[1]}, {new: true}, (err, data) =>{
    if(err){
      console.log(err);
    }
    else{
      console.log(data);
    }
  })
 
  var textto = "name:"+new_data[0]+",rent:"+new_data[1];
  const responseBody = {
        version: "2.0",
        template: {
          outputs: [
            {
              simpleText: {
                text: textto
              }
            }
          ]
        }
      };
    
      res.send(responseBody);
})

apiRouter.post('/reply', function(req,res){
  const text = req.body.userRequest.utterance;
  const userid = req.body.userRequest.user.id;
  console.log('user:'+ userid + ' message : ' + text);
  //var s1 = 
  new Subscriber({ name: text, id:userid}).save();
  // console.log(s1);


  // const users = Subscriber.find();
  // console.log(users);
  // Subscriber.create(
  //     {
  //       name: text,
  //       id: userid,
  //     },
  //     function(error,saveDocument){
  //       if (error) console.log(error);
  //       console.log(saveDocument);
  //     }
  //   )
  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: "reply test"
          }
        }
      ]
    }
  };

  res.send(responseBody);
})
/////
//var person = {};
//이렇게 먼저 선언 하고
//person.name = "이혜진"
//이렇게 하면 자동으로 객체에 추가됨
/////
//함수 function name(전달인자)
//return a+b;이런거 또같
//post함수 안에서 데이터 저장하는 함수를 호출하는것도 방법일수도
//전역변수는 함수 밖에서 var people;하고
//함수안에서는 var안붙이고 people=0;이렇게 하면됨
apiRouter.post('/studentid', function(req,res){
  const num = req.body.userRequest.utterance;
  const userid = req.body.userRequest.user.id;
  console.log('user:'+ userid + ' message : ' + num);
  Subscriber.update({ id: userid},{$set: {studentid: num}});
  console.log(Subscriber);
  // const users = Subscriber.find();
  // console.log(users);
  // Subscriber1.update(
  //   {
  //     $set: {studentid = num}
  //   }

  // );
  const responseBody = {
    "version": "2.0",
    "template": {
        "outputs": [
            {
                "simpleText": {
                    "text": "test"
                }
            }
        ]
    }
}
  res.send(responseBody)
})
app.listen(8080,function(){
  console.log('listening on port 8080')
});
// if (question != ''){
// Subscriber.create(
//   {
//     name: "annie",
//     age: "22"
//   },
//   function(error,saveDocument){
//     if (error) console.log(error);
//     console.log(saveDocument);
//   }
// )};