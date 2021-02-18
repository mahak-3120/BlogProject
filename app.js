const express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    methodOverride= require("method-override");
    expressSanitizer= require("express-sanitizer");


// Database name = blogAppDB
// APP CONFIG- Setup mongoose
mongoose.connect("mongodb://localhost:27017/blogAppDB",{
    useNewUrlParser : true,
    useUnifiedTopology : true
})
.then(()=> console.log("Connected to DB"))
.catch(error=>console.log(error.message));

app.set("view engine","ejs");
app.use(express.static("public")); // for custom stylesheet
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

// to avoid deprecation warning for findbyidandupdate method
mongoose.set('useFindAndModify',false); 

//Schema 
// MONGOOSE/MODEL CONFIG
const blogSchema = new mongoose.Schema({
    title : String,
    image : String,
    body  : String,
    created : {type: Date, default : Date.now}
});

//Model
const Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "A fresh beginning for a better tomorrow",
//     image: "https://images.unsplash.com/photo-1494029722188-672a328c4989?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
//     body: "Well things have been tough for everybody this year but this is temporary only our hardwork prevails.."
// },(err,new_blog)=>{
//     if(err){console.log("issue in adding new blog");}
//     else{
//         console.log("Added successfully");
//         console.log(new_blog);
//     }
// });

// RESTFUL ROUTES
app.get("/", (req,res)=>{
    res.redirect("/blogs");
});
// Index route 
app.get("/blogs", (req,res)=>{
    Blog.find({},(err, blogs)=>{
        if(err){
            console.log("Error!!");
        }else{
            res.render("index",{blogs: blogs});
        }
    });
});
// New Route
app.get("/blogs/new",(req,res)=>{
    res.render("new");
});
// Create Route
app.post("/blogs",(req,res)=>{
    //create blog  
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog ,(err,new_blog)=>{
        if(err){
            res.render("new");
        }
        else{
           //then redirect to index
           res.redirect("/blogs");
        }
    });  
});

// Show Route
app.get("/blogs/:id",(req,res)=>{
    Blog.findById(req.params.id, (err, foundBlog)=>{
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("show", {blog : foundBlog});
        }
    });
});

// Edit Route
app.get("/blogs/:id/edit",(req,res)=>{
    Blog.findById(req.params.id, (err, foundBlog)=>{
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("edit",{blog : foundBlog});
        }
    });
});
// Update Route
app.put("/blogs/:id",(req,res)=>{
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog)=>{
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs/"+req.params.id);
        }
    });
});

//Destroy route
app.delete("/blogs/:id",(req,res)=>{
    Blog.findByIdAndRemove(req.params.id, (err)=>{
        if(!err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs");
        }
    });
});


//listen route
app.listen(3000,()=>{
    console.log("Server is running");
});