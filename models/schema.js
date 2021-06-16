const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");
var date = moment().format('YYYY-MM-DD HH:mm:ss');

const userSchema = new Schema({
    kakaoid : String,
    name : String,
    detailname : String
});
const user = mongoose.model('user', userSchema);

const adminSchema = new Schema({
    kakaoid : { type: String, default: ''},
    code : { type: String, default: 'rhksfl2020'},
    loginID : { type: String, default: 'baram2020'},
    loginPW : { type: String, default: '7410'}
});
const admin = mongoose.model('admin', adminSchema);

var goodsSchema = new Schema({
    name : String,
    total : Number,
    rent : Number
});
//goodsSchema.plugin(autoIncrement.plugin, {model: 'goods', field: 'id', startAt: 1, increment: 1 });
const goods = mongoose.model('goods', goodsSchema);

var goodspageSchema = new Schema({
    name : {
        type: String, 
        required: [true, '물품명을 입력해주세요.']
    },
    category: {
        type: String,
        default: '기타'
    },
    total : {
        type: Number, 
        required: [true, '물품 수량을 입력해주세요.']
    },
    rent : Number,
    thumbnail: String,
    description: String
});
goodspageSchema.plugin(autoIncrement.plugin, {model: 'goodspage', field: 'id', startAt: 1, increment: 1 });
const goodspage = mongoose.model('goodspage', goodspageSchema);

var CategorySchema = new Schema({
    category: {
        type: String, 
        required: [true, '추가할 카테고리 입력해주세요.']
    },
    sorting: Number
});
const category = mongoose.model('category', CategorySchema);

var rentSchema = new Schema({
    kakaoid : String,
    username: String,
    goodsname: String,    
    quantity : Number,
    rentdate :{ type: String, default: date},//Date.now 
    returnList : { type: Boolean, default: false}
})
const rent = mongoose.model('rent', rentSchema);

var visitSchema = new Schema({
    kakaoid : String,
    username: String,
    phone: Number,    
    with :{type: Number, default: 0},
    date :{ type: String, default: date},//Date.now 
})
const visit = mongoose.model('visit', visitSchema);

var waitingSchema = new Schema({
    kakaoid : String,
    username: String,
    goodsname: String,    
    quantity : Number,
    waitdate :{ type: String, default: date},//Date.now 
    callingList : { type: Boolean, default: false}
})
const waiting = mongoose.model('waiting', waitingSchema);

module.exports = { 
    User: user,
    Admin: admin,
    Goods: goods,
    GoodsPage: goodspage,
    Category: category,
    Rent: rent,
    Visit: visit,
    Wait: waiting,
}
