const express = require('express');
const router = express.Router();

router.route('/member/edit/:id') 
.all((req,res,next)=>{
    res.locals.memberData = {
        name: "Benson",
        id: req.params.id
    };
    next();
})
.get((req,res)=>{
    const obj = {
        baseUrl: req.baseUrl,
        url: req.url,
        data:res.locals.memberData
    };
    res.send("GET :"+JSON.stringify(obj));
})
.post((req,res)=>{
    res.send("POST :"+JSON.stringify(res.locals.memberData));
})

module.exports = router;