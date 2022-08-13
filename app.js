require('dotenv').config()
const express = require("express");
const bodyparser = require("body-parser")
const ejs = require("ejs");
const { urlencoded } = require("body-parser");
const mongoose = require("mongoose");
const https = require("https");
const nodemailer = require('nodemailer');
const { stringify } = require("querystring");
const { dirname } = require('path');

// mongoose.connect('mongodb://localhost:27017/portfolioWeb')
mongoose.connect(process.env.MONGO_URI)

const dbSchema = new mongoose.Schema({
    name: String,
    post: String
})

const comment = mongoose.model("comment", dbSchema);
// comment.insertMany([
//     {
//         name: "Ema",
//         post: "I found Saad from fiverr for my nft project. I was finding someone who can help me making my own nft collection. I told Saad about my work. I was really surprised by seeing the quality of work that he gave me it was really great. He completed the order in the given time. His communication level is great. I would strongly suggest you Saad for..."
//     },
//     {
//         name: "John",
//         post: "I found Saad from fiverr for my nft project. I was finding someone who can help me making my own nft collection. I told Saad about my work. I was really surprised by seeing the quality of work that he gave me it was really great. He completed the order in the given time. His communication level is great. I would strongly suggest you Saad for..."
//     },
//     {
//         name: "Jacob",
//         post: "I found Saad from fiverr for my nft project. I was finding someone who can help me making my own nft collection. I told Saad about my work. I was really surprised by seeing the quality of work that he gave me it was really great. He completed the order in the given time. His communication level is great. I would strongly suggest you Saad for..."
//     },
//     {
//         name: "David",
//         post: "I found Saad from fiverr for my nft project. I was finding someone who can help me making my own nft collection. I told Saad about my work. I was really surprised by seeing the quality of work that he gave me it was really great. He completed the order in the given time. His communication level is great. I would strongly suggest you Saad for..."
//     }
// ])

let array = ['images/menn.png', 'images/men2.png', 'images/men3.png']
let flag = 0;

let transporter = nodemailer.createTransport({
    host: "mail.pakscholarsinstitute.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "info@pakscholarsinstitute.com", // generated user
        pass: process.env.PASSWORD, // generated password
    },
    tls: {
        rejectUnauthorized: false
    }
});

const app = express();
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static('public'))

app.set('view engine', 'ejs');
let val = {};
app.get("/", function (req, res) {
    comment.find({}, function(err, value){
        if (err) {
            console.log(err)
        }
        else{
            val =value;
            res.render("index", {object: value, arr: array, flag: flag})
            flag=0;
        }
    })
})

app.get("/post", function(req, res){
    res.render("post", {object: val})
})




app.post("/", function (req, res) {
    if (req.body.contactForm === "contact") {
        const url = process.env.URL;
        const option = {
            method: "POST",
            auth: process.env.AUTH
        }
        const userData = {
            members: [
                {
                    status: "subscribed",
                    "email_address": req.body.email,
                    merge_fields: {
                        "MESSAGE": req.body.message,
                    }
                }
            ]
        }
        const jsondata = JSON.stringify(userData);
        const request = https.request(url, option, function (response) {
            response.on("data", function (data) {
                if (response.statusCode === 200) {
                    var mailOptions = {
                        from: '"Saad signs" <info@pakscholarsinstitute.com>',
                        to: `saadaslam6866@gmail.com`,
                        subject: 'New contact',
                        text: "Hi, saad khan someone contacted you through your portfolio check his message on mailchimp, Thanks"
                    };
                    transporter.sendMail(mailOptions);
                    flag = 1;
                    res.redirect("/");
                }
                else {
                    flag = 2;
                    res.redirect("/");
                }
            })
        })
        request.write(jsondata);
        request.end();
    }
    else{
        const Comment = new comment({
            name: req.body.titleText,
            post: req.body.postText
        })
        Comment.save(function(err){
            if(err){
                flag = 2;
                res.redirect("/");
            }
            else{
                flag =3;
                res.redirect("/")
            }
        });
    }
})



let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);