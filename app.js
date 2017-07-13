const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const expressSanitizer = require("express-sanitizer");

mongoose.connect('mongodb://localhost/rest-blog');

const app = express();

//         app config
app.use(expressSanitizer());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

//         Set the Schema and model on mongoose

var blogSchema = new mongoose.Schema({
    title: String,
    img: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

//         Crear las rutas RESTful de la página

// INDEX ROUTE
app.get("/", function(req, res){
    res.redirect("blogs");
});

app.get("/blogs", function(req, res){

    //Get all the camps from the db
    Blog.find({}, function(err, allblogs){
        if(err) {
            console.log(err);
        } else {
            res.render("blogs", {blogs: allblogs});
        }
    })
});

// NEW ROUTE
app.get("/blogs/new", function(req, res){
    res.render("new");
});

// CREATE ROUTE
app.post("/blogs", function(req, res){
    // Evitar que ocupen scripts en la parte de escribir el blog
    req.body.body = req.sanitize(req.body.body);

    // Crear el constructor que generará los posts y los guarda en la db
    Blog.create({
        title: req.body.title,
        img: req.body.img,
        body: req.body.body
    }, function(err, blog){
        if(err){
            console.log(err);
        } else {
            // redireccionar a la página de blogs
            res.redirect("/blogs");
        }
    });

});

// SHOW ROUTE
app.get("/blogs/:id", function(req, res){

    Blog.findById(req.params.id, function(err, foundBlog){
        if(err) {
            console.log(err);
        } else {
            res.render("show", {blog: foundBlog});
        }
    });

});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err) {
            res.render("blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    // evitar que ocupen scripts en la aprte de escribir el blog
    req.body.body = req.sanitize(req.body.body);
    // encontarás el por 3 parametros, blog por id, new data, and callback
    Blog.findByIdAndUpdate(req.params.id, req.body, function(err, updatedBlog){
        //console.log(req.body);
        if(err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/"+req.params.id);
        }
    });
});

// DELETE ROUTE

app.delete("/blogs/:id", function(req, res){
    //res.send("Deleted!!!");
    Blog.findByIdAndRemove(req.params.id, function(err, removeBlog){
        if(err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server is listening!")
});
