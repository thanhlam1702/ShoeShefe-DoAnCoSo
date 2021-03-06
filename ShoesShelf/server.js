const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const { ensureAuthenticated ,  forwardAuthenticated } = require('./config/auth');
const passport = require('passport');
const bodyParser =require("body-parser");
const formidable = require('formidable');
const upload = require('./middleware/upload');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override')
var fs = require('fs');

const fullTextSearch = require('fulltextsearch');
var fullTextSearchVi = fullTextSearch.vi;


var app = express();
app.use(cookieParser('dasdasd'))
app.use(bodyParser.urlencoded( {extended: true}));
app.use(bodyParser.json());
app.use(methodOverride('_method'))
//Passport config
require('./config/passport')(passport);

// DB config
const db = require('./config/keys').MongoURI;

//connect to Mongo
mongoose.connect(db, { useNewUrlParser: true})
    .then(() => console.log('MongoDB connected....'))
    .catch(err => console.log(err));
//EJS
app.set('view engine','ejs');

//Bodyparser
app.use(express.urlencoded({extended: false}));

// Express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// connect flash
app.use(flash());

// Global Vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error=req.flash('error');
    next();
})
// Routes
app.use('/',require('./routes/index'));
var au = require('./middleware/admin-auth')
app.use('/users',require('./routes/users'));
var auth =require('./middleware/auth');
//static files
app.use(express.static(__dirname,''));
var Post = require('./models/Post');
var User = require('./models/User');
// SS blog post

var MongoClient = require("mongodb").MongoClient;
MongoClient.connect(db, { useNewUrlParser: true}, function(error,client){
    var test = client.db("test");
    console.log("DB connect");

    app.post('/save',auth.requireAuth,function (req,res){
        var _id = mongoose.mongo.ObjectId(req.cookies.idpost);
        test.collection("users").updateOne(
        { "email" : req.cookies.email },
        { $push : { "post_save" : _id}},
        )
        res.redirect('/your-shelf')
    })
    app.get("/wanna-rock",auth.requireAuth,(req,res)=> {
        users = User.aggregate([{
            $lookup:{
                from:"posts",
                localField:"post_save",
                foreignField:"_id",
                as: "Con"
            }
        }],function(err,data){
            if(err){
                return res.json({ kq : 0});
            }else{
                // res.json(data);
                res.render('wanna-rock',{users:data,name:req.cookies.name,avatar:req.cookies.avatar,id:req.cookies.id });
            }
        })
    })
    app.get("/your-shelf",auth.requireAuth,(req,res) => {
        Post.find(function(err,data){
            if(err){
                res.json({kq:0});
            }else{
                res.render('your-shelf',{posts:data,name:req.cookies.name,avatar:req.cookies.avatar,id:req.cookies.id,post_save:req.cookies.post_save });
            }

        })
    });
    app.get("/my-shelf",auth.requireAuth,(req,res) => {
        Post.find(function(err,data){
            if(err){
                res.json({kq:0});
            }else{
                res.render('your-shelf',{posts:data,name:req.cookies.name,avatar:req.cookies.avatar,id:req.cookies.id,post_save:req.cookies.post_save });
            }

        })
    });
    app.get("/new-shoes",auth.requireAuth,(req,res) => {
        Post.find(function(err,data){
            if(err){
                res.json({kq:0});
            }else{
                res.render('new-shoes',{posts:data,name:req.cookies.name,avatar:req.cookies.avatar,id:req.cookies.id,post_save:req.cookies.post_save,email:req.cookies.email });
            }

        })
    });
    app.get("/update",auth.requireAuth,(req,res) => {
        Post.find(function(err,data){
            if(err){
                res.json({kq:0});
            }else{
                res.render('update',{posts:data,name:req.cookies.name,avatar:req.cookies.avatar,id:req.cookies.id,post_save:req.cookies.post_save });
            }

        })
    });
    app.get("/update-page",auth.requireAuth,(req,res) => {
        Post.find(function(err,data){
            if(err){
                res.json({kq:0});
            }else{
                res.render('update-page',{posts:data,name:req.cookies.name,avatar:req.cookies.avatar,id:req.cookies.id,post_save:req.cookies.post_save });
            }

        })
    });
    app.get("/account-setting" ,(req,res) => {
        User.findById(req.cookies.id,function(err,data){
            if(err){
                res.json({kq:0});
            }else{
                res.cookie('id',data.id)
                res.cookie('email',data.email)
                res.cookie('name',data.name)
                res.cookie('avatar',data.avatar)
                res.render('account-setting',{user:data,name:req.cookies.name,avatar:req.cookies.avatar,email:req.cookies.email});
            }

        })
    });

    app.post("/account-setting",auth.requireAuth ,(req,res) => {
        User.findByIdAndUpdate(req.cookies.id,{
            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
            gender:req.body.selector,
            country:req.body.country
        },function(err,data){
            if(err){
                res.json({kq:0});
            }else{
                res.redirect('/account-setting')
            }

        })
    });
    
    app.post("/account-password",auth.requireAuth ,(req,res) => {
        User.findByIdAndUpdate(req.cookies.id,{
            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
            avatar:req.body.avatar
        },function(err,data){
            if(err){
                res.json({kq:0});
            }else{
                res.redirect('/account-setting')
            }

        })
    });
    app.post("/upload-avatar",upload.single('avatar'),auth.requireAuth ,(req,res) => {
        User.findByIdAndUpdate(req.cookies.id,{
            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
            avatar:req.file.filename,
            gender:req.body.selector

        },function(err,data){
            if(err){
                res.json({kq:0});
            }else{
                res.redirect('/account-setting')
            }

        })
    });
    

    app.get("/your-shelf-fbgg" ,(req,res) => {
        test.collection("posts").find().toArray(function(error,posts){
            posts = posts.reverse();
            res.render('your-shelf-fbgg',{posts : posts});
        })
    });
    app.get("/main",auth.requireAuth,(req,res) => {
        if (req.query.search) {     
                const regex = new RegExp(fullTextSearchVi(req.query.search), 'gi');

                Post.find({brands : regex} ,function(err,data){
                    if(err){
                        res.json({kq:0});
                    }else{
                        var noMatch = ""
                        if(data.length < 1) {
                            noMatch = "Không có kết quả bạn cần tìm, vui lòng thử lại.";
                        }
                        res.render('main',{posts:data,name:req.cookies.name,avatar:req.cookies.avatar, noMatch: noMatch});
                    }
            });
        } else {
            Post.find(function(err,data){
                if(err){
                    res.json({kq:0});
                }else{
                    res.render('main',{posts:data,name:req.cookies.name,avatar:req.cookies.avatar});
                }

            })
        };
    });

    app.get("/search-status-index",(req,res) => {
        if (req.query.search) {     
                const regex = new RegExp(fullTextSearchVi(req.query.search), 'gi');
                Post.find({status : regex} ,function(err,data){
                    if(err){
                        res.json({kq:0});
                    }else{
                        var noMatch = ""
                        if(data.length < 1) {
                            noMatch = "Không có kết quả bạn cần tìm, vui lòng thử lại.";
                        }
                        res.render('index',{posts:data, noMatch: noMatch});
                    }
            });
        } else {
            Post.find(function(err,data){
                if(err){
                    res.json({kq:0});
                }else{
                    res.render('index',{posts:data});
                }

            })
        };
    });

    app.get("/search-status",auth.requireAuth,(req,res) => {
        if (req.query.search) {     
                const regex = new RegExp(fullTextSearchVi(req.query.search), 'gi');
                Post.find({status : regex} ,function(err,data){
                    if(err){
                        res.json({kq:0});
                    }else{
                        var noMatch = ""
                        if(data.length < 1) {
                            noMatch = "Không có kết quả bạn cần tìm, vui lòng thử lại.";
                        }
                        res.render('main',{posts:data,name:req.cookies.name,avatar:req.cookies.avatar, noMatch: noMatch});
                    }
            });
        } else {
            Post.find(function(err,data){
                if(err){
                    res.json({kq:0});
                }else{
                    res.render('main',{posts:data,name:req.cookies.name,avatar:req.cookies.avatar});
                }

            })
        };
    });
    
    app.delete('/:id', async (req,res) => {
        await Post.findByIdAndDelete(req.params.id)
        res.redirect('/admin')
        
    })
    app.get('/user/:id',function (req,res) {
        Post.findByIdAndDelete(req.params.id,function(err,data){
                if(err){
                    res.json({kq:0})
                }else{
                    res.redirect("/your-shelf")
                }
        })

      })
        

    
    app.get("/" ,(req,res) => {
        if (req.query.search) {     
            const regex = new RegExp(fullTextSearchVi(req.query.search), 'gi');

            Post.find({brands : regex},function(err,data){
                if(err){
                    res.json({kq:0});
                }else{
                    var noMatch = ""
                    if(data.length < 1) {
                        noMatch = "Không có kết quả bạn cần tìm, vui lòng thử lại.";
                    }
                    res.render('index',{posts:data,noMatch: noMatch});
                }
        });
        } else {
            Post.find(function(err,data){
                if(err){
                    res.json({kq:0});
                }else{
                    res.render('index',{posts:data});
                }

            })
        };   
    });
    app.get('/posts/:id',auth.requireAuth,function(req,res,next){
        Post.find(function(err,data){
            if(err){
                res.json({kq:0});
            }else{
                res.render('posts',{output:req.params.id,posts:data,name:req.cookies.name,avatar:req.cookies.avatar,id:req.cookies.id,idpost:req.cookies.idpost });
            }

        })
    });
    app.delete('/users/:id', async (req,res) => {
        await User.findByIdAndDelete(req.params.id)
        res.redirect('/manager-account')
        
    })
    app.get('/update/:id',auth.requireAuth,function(req,res,next){
        Post.find(function(err,data){
            if(err){
                res.json({kq:0});
            }else{
                res.render('update',{output:req.params.id,posts:data,name:req.cookies.name,avatar:req.cookies.avatar,id:req.cookies.id,idpost:req.cookies.idpost });
            }

        })
    });

    app.post("/update-post", upload.array('image', 20) ,auth.requireAuth ,(req,res) => {
        Post.findByIdAndUpdate(req.cookies.idpost,{
            title:req.body.title,
            status:req.body.status,
            brands:req.body.brands,
            hashtag:req.body.hashtag,
            collections:req.body.collections,
            email_post:req.body.txtEmailpost,
            id_post:req.body.txtIdpost,
            user_name:req.body.txtUser,
            user_avatar:req.body.txtAvatar,
            image : req.files
        },function(err,data){
            if(err){
                res.json({kq:0});
            }else{
                res.redirect('/your-shelf')
            }

        });
    });
});
    


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

const PORT = process.env.PORT || 4444;

app.listen(PORT, console.log(`server run on port ${PORT}`));