const Express = require("express");
const Body_parser = require("body-parser");
const Mongoose = require("mongoose");
const Cors =  require("cors");
const path=require('path');
const PORT = 3005;
const Bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Multer = require('multer');
const UserModel = require("./models/Users");
const ReqModel = require('./models/requirement')

const app =new Express();
app.use("/uploads",Express.static("./uploads"));

app.use(Express.static(path.join(__dirname+'/Frontend')));
app.use(Body_parser.json());
app.use(Body_parser.urlencoded({extended:true}));
app.use(Cors());


Mongoose.connect("mongodb+srv://ictakcurriculum:anprs@ictak-curriculum-tracke.k6qgvbb.mongodb.net/UserDB?retryWrites=true&w=majority",{useNewUrlParser: true});


//signup 

app.post('/signup',async(req,res)=>{
    
    try {
        let data = {
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            username : req.body. username,
            password : Bcrypt.hashSync(req.body.password,10),
            confirmPassword  : Bcrypt.hashSync(req.body.confirmPassword,10)
          
            
        }
        // console.log(data);
        let User = await UserModel.findOne({email : req.body.email})
        if(!User){
            const newUser = new UserModel(data);
            await newUser.save( (error,data)=>{
                if (error) {
                    res.json({"status": "Failed", "Error": error});
                } else {
                    res.json({"status": "success", "Data": data});
                }
            });
            
            
        }
        else{ 
            res.json({message :"Email already registered"});
        }
    } catch (error) {
        console.log(error)
                 
    }
})
//lOGIN
app.post("/login",(req,res)=>{
    try{  
       var email =req.body.email;
       var password=req.body.password;
        
       if(email=="admin@gmail.com",password=="admin"){
        res.json({message :"admin login"})
       }
        else{
            UserModel.find({ email : email },(err,data)=>{
            if(data.length>0){
               
               const PasswordValidator=Bcrypt.compareSync(password,data[0].password)
               if(PasswordValidator){
                    jwt.sign({email :email ,id:data[0]._id},"ictakproject",{expiresIn:"1d"},
                    (err,token)=>{
                       if (err) {
                           res.json({"status":"error","error":err}) 
                       } 
                       else {
                           res.json({"status":"success","data":data,"token":token})
                           
                       }
                    })
                   
               }
               else{
                   res.json({"Status":"Failed to Login","data":"Invalid Password"})
               }
           }
           else{
               res.json({"Status":"Failed to Login","data":"Invalid Email id"})
           }
       })
   }}catch(error){
       console.log(error)
   }
    
   })


   //REQUIREMENT 
//FILE UPLOAD
const fileStorageEngine = Multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, './uploads')	//foldername
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname + Date.now().toString()+'.pdf')
    }
})


//middleware
const upload = Multer({storage: fileStorageEngine});

app.post('/addrequirement',upload.single("photo"), async (req, res) => {

    try {
        let data1 = {
            reqname: req.body.reqname,
            area: req.body.area,
            institution: req.body.institution,
            catagory: req.body.catagory,
            hours: req.body.hours,
            imgpath:req.file.filename

        }
        console.log(data1);
        let requirements = await ReqModel.findOne({ reqname: req.body.reqname })
        if (!requirements) {
            const newReq = new ReqModel(data1);
            const saveReq = await newReq.save();
            res.json(saveReq);
            console.log(saveReq)
        }
        else {
            res.json({ message: "Requirement already added" });
        }
    } catch (error) {
        console.log(error)

    }
})

//Receive Reqrmnt

app.post('/recvrequirement',(req,res)=>{
    var data=req.body;
    var reqrdata=new ReqModel(data);
    reqrdata.save(
        (err,data)=>{
            if (err) {
                res.json({"status":"error","error":err})
            } else {
              res.json({"status":"success","data":data})  
            }
        }
    );
})




   


app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/Frontend/public/index.html'));
});
// listen
app.listen(PORT,()=>{
    console.log(`Server started listening to port ${PORT}`);
})



