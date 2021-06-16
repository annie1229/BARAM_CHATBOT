module.exports = function(app, User)
{
    app.post('/create', function(req, res){
        var user = new User();
        user.id = req.body.id;
        user.text = req.body.text;

        console.log(req);

        exam.save(function(err){
            if(err){
                // fail
                console.error(err);
                res.json({result: 0});
                return;
            }
            // Success
            res.json({result: 1});
        });
    });
}