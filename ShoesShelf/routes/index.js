const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated ,  forwardAuthenticated } = require('../config/auth');

//User model
const User = require('../models/User');


router.get('/', (req,res) => res.render('index'));

router.get('/About.html',(req,res) => res.render('About'));

router.get('/your-shelf',(req,res) => res.render('your-shelf'));


//Login handle
router.post('/login',(req,res,next) => {
    passport.authenticate('local', {
        successRedirect : '/main',
        failureRedirect : '/users/login',
        failureflash: true
    })(req, res, next);
});
router.post('/register',(req,res)=> {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    User.findOne({ email: email })
            .then(user => {
                if(user) {
                    //User exists
                    errors.push({ msg: 'Email đã được sử dụng'});
                    res.render('register',{
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });
                    
                    //Ma hoa password
                    bcrypt.genSalt(10, (err, salt)=> 
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            //Set password to hashed
                            newUser.password = hash;
                            //Save user
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg','Bạn đã tạo tài khoản thành công bây giờ bạn có thể đăng nhập');
                                    res.redirect('/');
                                })
                                .catch(err => console.log(err));
                        })
                    )
                }
            })
    
});

//logout  handle
router.get('/logout',(req,res) => {
    req.logout();
    req.flash('success_msg','You are logout');
    res.redirect('/');
});

//Dashboard
router.get('/main',ensureAuthenticated, (req,res) => 
    res.render('main', {
        name: req.user.name
    })
);    

module.exports = router;