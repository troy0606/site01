module.exports = app => {
    app.get('/admin1/:admin1-a?/:admin1-b?',(req,res) => {
        res.json(req.params);   
    })
};