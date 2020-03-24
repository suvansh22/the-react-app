var express = require('express');
var router = express.Router();
var pool = require('./pool');
var multer =require('./multer');
const nodemailer=require("nodemailer");
var otpGenerator=require('otp-generator');
process.env.Node_TLS_REJECT_UNAUTHORIZED="0";
var sec;

const RandomString=(length)=>{
  let text="";
  const possible="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWZYZ0123456789";
  for(let i=0;i<length;i++)
  {
    text+=possible.charAt(Math.floor(Math.random()*length))
  }
  return text;
}

router.post('/otp',function(req,res,next){
  let otp=otpGenerator.generate(4,{upperCase:false,specialChars:false,alphabets:false,digits:true});
  sec=otp;
  //console.log("send:",otp)
  //console.log("body:",req.body)
    var mail=req.body.email;
    console.log("rec:",mail)
let transporter=nodemailer.createTransport({
    service:'gmail',
    secure:false,
    auth:{
        user:'thedailyofferjuet@gmail.com',
        pass:'suvansh@12345'
    }
});
var msg='Your otp is: '+otp

let mailOptions ={
    from :'s22ubbu@gmail.com',
    to:mail,
    subject:'OTP',
    text:msg
};
transporter.sendMail(mailOptions,function(error,result){
    if(error)
    {
        console.log(error)
        return res.status(500).json({RESULT:false})
    }
    else{
        console.log('Email send')
        return res.status(200).json({RESULT:true});
    }
})
})

router.post('/signup',function(req,res,next){
  //console.log("comming1:",sec)
  //console.log("comming:",req.body.otp)
  let a=""
  let b=""
  let c=""
  if(sec==req.body.otp)
  {
  pool.query('insert into signup values(?,?,?,?,?,?,?)',[req.body.firstname,req.body.lastname,req.body.email,req.body.password,a,b,c],function(error,result){
    if(error)
    {
      console.log(error)
      return res.status(500).json({RESULT:false})
    }
    else
    {
      return res.status(200).json({RESULT:true})
    }
  })}
  else
  {
    return res.status(500).json({RESULT:false})
  }
});

router.post('/userlogin',function(req,res,next){
    pool.query('select * from signup where email = ? and password = ?',[req.body.email,req.body.password],function(error,result){
      if(error)
      {
        console.log(error)
      }
      else
      {
        //console.log(result.length)
        if(result.length==0)
        {
          console.log('wrong cridentials')
          return res.status(500).json({RESULT:false})
        }
        else
        {
          return res.status(200).json(result[0])
        }
      }
    })
})
router.post('/addcategory',function(req,res,next){
  //console.log(req.body)
  pool.query('insert into category values(?,?)',[req.body.id,req.body.name],function(error,result){
    if(error)
    {
      console.log(error)
      return res.status(500).json({RESULT:false})
    }
    else
    {
      return res.status(200).json({RESULT:true})
    }
  })
})
router.post('/addsubcategory',function(req,res,next){
  pool.query('insert into subcategory values(?,?,?)',[req.body.id,req.body.name,req.body.categoryid],function(error,result){
    if(error)
    {
      console.log(error)
      return res.status(500).json({RESULT:false})
    }
    else
    {
      return res.status(200).json({RESULT:true})
    }
  })
})
router.get('/categoryid',function(req,res,next){
  pool.query('select * from category',function(error,result){
    if(error)
    {
      console.log(error)
      return res.status(500)
    }
    else
    {
      return res.status(200).json(result)
    }
  })
})
router.post('/subcategoryid',function(req,res,next){
  console.log("ASd",req.body)
  pool.query('select id,name from subcategory where categoryid=?',[req.body.id],function(error,result){
    if(error)
    {
      console.log(error)
      return res.status(500)
    }
    else
    {
      return res.status(200).json(result)
    }
  })
})
router.post('/callinfo',function(req,res,next){
  console.log("ads",req.body.email)
  pool.query('select * from signup where email= ?',[req.body.email],function(error,result){
    if(error)
    {
      console.log(error)
      return res.status(500)
    }
    else
    {
      return res.status(200).json(result[0])
    }
  })
})
router.post('/updateinfo',multer.single('pic'),function(req,res,next){
  //console.log("hi")
  let q=''
  if(req.body.username)
  {
    q="update signup set username='"+req.body.username+"'where email='"+req.body.email+"'"
  }
  else if(req.body.emailvalue)
  {
    q="update signup set email='"+req.body.emailvalue+"'where email='"+req.body.email+"'"
  }
  else if(req.body.mobile)
  {
    console.log("aDS:",req.body.mobile)
    var a=parseInt(req.body.mobile)
    q="update signup set mobile='"+req.body.mobile+"'where email='"+req.body.email+"'"
  }
  else if(req.body.file)
  {
    console.log("RR:",req.body.file)
    q="update signup set pic='"+req.file.originalname+"'where email='"+req.body.email+"'"
  }
  pool.query(q,function(error,result){
    if(error)
    {
      return res.status(500).json({RESULT:false});
    }
    else
    {
      return res.status(200).json({RESULT:true})
    }
})
})
router.post('/updatepic',multer.single('pic'),function(req,res,next){
  //console.log(req.body);
  //console.log(req.file);
  var fn=req.file.originalname;
  pool.query('update signup set dp = ? where email = ?',[fn,req.body.email],function(error,result){
    if(error)
    {
      console.log(error)
      return res.status(500).json({RESULT:false})
    }
    else
    {
      return res.status(200).json({RESULT:true})
    }
  })
});
router.post('/emailcheck',function(req,res,next){
  pool.query('select email from signup where email= ?',[req.body.email],function(error,result){
    if(error)
    {
      console.log(error)
    }
    else
    {
      if(result.length==0)
      {
        return res.status(500).json({RESULT:true})
      }
      else
      {
        return res.status(200).json({RESULT:false})
      }
    }
  })
})
router.get('/idcheck',function(req,res,next){
  pool.query('SELECT id FROM offer ORDER BY id DESC LIMIT 1',function(error,result){
    if(error)
    {
      console.log(error);
    }
    else
    {
      if(result.length===0)
      {
        return res.status(200).json(0)
      }
      else
      {
      return res.status(200).json(result[0].id)
      }
    }
  })
})
router.post('/forgotpassword',function(req,res,next){
  let token=RandomString(40);
  pool.query('select email from signup where email=?',[req.body.email],function(error,result){
    if(error)
    {
      return res.status(500).json({RESULT:false});
    }
    else
    {
      if(result.length==0)
      {
        return res.status(500).json({RESULT:'NOT FOUND'})
      }
      else
      {
        let dateval=Date.now()+(30*60000);
      pool.query('insert into tokenlink values(?,?,?,?)',[token,req.body.email,dateval,0],function(error,result){
        if(error)
        {
          console.log(error)
          return res.status(500).json({RESULT:false});
        }
      });
      console.log("send:",token)
        var mail=req.body.email;
        console.log("rec:",mail)
    let transporter=nodemailer.createTransport({
        service:'gmail',
        secure:false,
        auth:{
            user:'thedailyofferjuet@gmail.com',
            pass:'suvansh@12345'
        }
    });
    
    let mailOptions ={
        from :'s22ubbu@gmail.com',
        to:mail,
        subject:'Password reset mail',
        text:`Please use the following link to reset your password: http://localhost:3000/passwordreset/${token} (only available for 30 mins)`
    };
    transporter.sendMail(mailOptions,function(error,result){
        if(error)
        {
            console.log(error)
            return res.status(500).json({RESULT:false})
        }
        else{
            console.log('Email send')
            return res.status(200).json({RESULT:true});
        }
    })
      }
    }
  })
})
router.post('/tokencheck',function(req,res,next){
  console.log(req.body)
  pool.query('select email,validity,status from tokenlink where token=?',[req.body.token],function(error,result){
    if(error)
    {
      return res.status(500).json({RESULT:false});
    }
    else
    {
      if(result.length==0)
      {
        return res.status(500).json({RESULT:false})
      }
      else
      {
        if(Date.now()<=result[0].validity)
        {
          if(result[0].status==0)
          {
            return res.status(200).json(result[0]);
          }
          else(result[0].status==1)
          {
            return res.status(200).json({RESULT:false});
          }
        }
        else if(Date.now()>result[0].validity)
        {
          return res.status(200).json({RESULT:false});
        }
      }
    }
  })
})
router.post('/changepassword',function(req,res,next){
  q="update signup set password='"+req.body.password+"'where email='"+req.body.email+"'"
  pool.query(q,function(error,result){
    if(error)
    {
      return res.status(500).json({RESULT:false});
    }
    else
    {
      pool.query("update tokenlink set status = 1 where email =?",[req.body.email],function(error,result){
        if(error)
        {
          return res.status(500).json({RESULT:false});
        }
        else
        {
          return res.status(200).json({RESULT:true});
        }
      })
    }
  })
})
router.post('/addoffer',multer.single('pic'),function(req,res,next){
  console.log(req.body)
  pool.query('insert into offer values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[req.body.subcategoryid,req.body.id,req.body.name,req.body.categoryid,req.body.tag1,req.body.tag2,req.body.tag3,req.body.description,req.file.originalname,req.body.validfrom,req.body.validto,req.body.city,req.body.tag4,req.body.location,0],function(error,result){
    if(error)
    {
      console.log(error)
      return res.status(500).json({RESULT:false});
    }
    else
    {
      return res.status(200).json({RESULT:true});
    }
  })
})



router.get('/calloffer',function(req,res,next){  
  offerCheck();
  pool.query('select * from offer',function(error,result){
    if(error)
    {
      console.log(error);
      return res.status(500).json({RESULT:false})
    }
    else
    {
      var rresult=[]
      for(var i in result)
      {
        if(result[i].start==1)
        {
          rresult=[...rresult,result[i]]
        }
      }
      return res.status(200).json(rresult)
    }   
  })
})

router.post('/callName',function(req,res,next){
  pool.query('select name from category where id=?',[req.body.id],function(error,result){
    if(error)
    {
      console.log(error)
      return res.status(500).json({RESULT:false});
    }
    else
    {
      return res.status(200).json(result);
    }
  })
})

router.post('/callSName',function(req,res,next){
  pool.query('select name from subcategory where id=?',[req.body.id],function(error,result){
    if(error)
    {
      console.log(error)
      return res.status(500).json({RESULT:false});
    }
    else
    {
      return res.status(200).json(result);
    }
  })
})

router.post('/offerpageinfo',function(req,res,next){  
  offerCheck();
  pool.query('select * from offer where name=?',[req.body.name],function(error,result){
    if(error)
    {
      console.log(error)
      return res.status(500).json({RESULT:false});
    }
    else
    {
      var rresult=[]
      for(var i in result)
      {
        if(result[i].start==1)
        {
          rresult=[...rresult,result[i]]
        }
      }
      return res.status(200).json(rresult);
    }
  })
})

router.post('/categorypageinfo',function(req,res,next){  
  offerCheck();
  pool.query('select id from category where name=?',[req.body.name],function(error,result){
  if(error)
  {
    console.log(error)
    return res.status(500).json({RESULT:false})
  }
  else{
  pool.query('select * from offer where categoryid=?',[result[0].id],function(error,result){
  if(error)
  {
    console.log(error)
    return res.status(500).json({RESULT:false});
  }
  else
  {
    var rresult=[]
    for(var i in result)
    {
      if(result[i].start==1)
      {
        rresult=[...rresult,result[i]]
      }
    }
    return res.status(200).json(rresult);
  }
})
}
})
})

router.get('/noofuser',function(req,res,next){
  pool.query('select count(email) as value from signup',function(error,result){
    if(error)
    {
      console.log(error)
      return res.status(500).json({RESULT:false})
    }
    else
    {
      return res.status(200).json(result)
    }
  })
})

router.get('/customerinfo',function(req,res,next){
  pool.query('select * from signup',function(error,result){
    if(error)
    {
      console.log(error)
      return res.status(500).json({RESULT:false})
    }
    else
    {
      return res.status(200).json(result)
    }
  })
})

router.get('/callcarouseloffer',function(req,res,next){  
  offerCheck();
  pool.query('select * from offer order by id desc limit 5',function(error,result){
    if(error)
    {
      console.log(error);
      return res.status(500).json({RESULT:false})
    }
    else
    {
      var rresult=[]
      for(var i in result)
      {
        if(result[i].start==1)
        {
          rresult=[...rresult,result[i]]
        }
      }
      return res.status(200).json(rresult)
    }   
  })
})
function offerCheck(){
  pool.query('select * from offer',function(error,result){
    if(error)
    {
      console.log(error);
    }
    else
    {
      for(var i in result)
      {
        var v=parseInt(result[i].validto)
        var b=parseInt(result[i].validfrom)
        if(b<=new Date().getTime() && result[i].start!=1)
        {
          pool.query('update offer set start=1 where id=?',[result[i].id],function(error,result){
            if(error)
            {
              console.log("no")
            }
            else
            {
              console.log("yes")
            }
          })
        }
        if(v<new Date().getTime())
        {
          pool.query('delete from offer where id=?',[result[i].id],function(error,result){
            if(error)
            {
              console.log("no")
            }
            else
            {
              console.log("yes")
            }
          })
        }
      }
    }   
  })
}
router.post('/searchresult',function(req,res,next){  
  offerCheck();
  pool.query('select * from offer where id=?',[req.body.id],function(error,result){
    if(error)
    {
      console.log(error)
      return res.status(500).json({RESULT:false})
    }
    else
    {
      var rresult=[]
      for(var i in result)
      {
        if(result[i].start==1)
        {
          rresult=[...rresult,result[i]]
        }
      }
      return res.status(200).json(rresult)
    }
  })
})
router.post('/search',function(req,res,next){
  console.log("JKL",req.body)
  pool.query('SELECT id FROM offer where name like "'+req.body.search+'" or tag1 like "'+req.body.search+'" or tag2 like "'+req.body.search+'" or tag3 like "'+req.body.search+'" or tag4 like "'+req.body.search+'"',function(error,result){
    if(error)
    {
      console.log(error)
      return res.status(500).json({RESULT:false})
    }
    else
    {
      return res.status(200).json(result)
    }
  })
})
module.exports=router;
