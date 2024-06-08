const express = require('express');
const mongoose = require('mongoose');
const facuser=require('./models/userregmodel');
const jwt=require('jsonwebtoken');


const cors=require('cors')
const app = express();

// Ensure the password is URL-encoded if it contains special characters
const encodedPassword = encodeURIComponent('Sath@projects123');
const dbURI = `mongodb+srv://SathwikUK:${encodedPassword}@projects.7zbjzgv.mongodb.net/projects?retryWrites=true&w=majority`;

mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Database connection successful');
}).catch((err) => {
    console.error('Database connection error:', err.message);
});
app.use(express.json());
app.use(cors({origin:"*"}))

app.get('/', (req, res) => {
    return res.send('Hello world!');
});

app.post('/register', async (req,res)=>{
    try{
        const {fullname,email,mobile,branch,password,confirmPassword}=req.body;
        const exist = await facuser.findOne({email})
        if(exist){
            return res.status(400).send("User Already Registered")
        }
        if(password!=confirmPassword){
            return res.status(403).send("password doesn't match")
        }
        let newuser= new facuser({
            fullname,email,mobile,branch,password,confirmPassword
        })
        newuser.save();
        return res.status(200).send('Registered Successfully')


    }
    catch(err){
        console.log(err)
        return res.status(500).send("Server Error")
    }
})


app.post('/login', async (req,res)=>{
    try{
        const {email,password}=req.body
        const exist = await facuser.findOne({email})
        if(!exist){
            return res.status(400).send("no user found")
        }
        if(exist.password != password){
            return res.status(400).send("Invalid password")
        }
        let payload = {
            user:{
                id:exist.id,
                fullname:exist.fullname
            }
        }
        jwt.sign(payload,'jwtPassword',{expiresIn:360000000},(err,token)=>{
            if(err) throw err
            return res.json({token})
        })

    }
    catch(err){
        console.log(err)
        return res.status(500).send("Server Error")
    }
})




app.listen(5001, () => {
    console.log('Server running on port 5001');
});