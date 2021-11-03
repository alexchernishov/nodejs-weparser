const express = require('express');
const router = express.Router();
const passport = require('passport');
const SkuModel = require('../models/SkuMapping');
const SkuModelObj=new SkuModel();
router.post('/add',passport.authenticate('jwt', { session: false }), function(req, res, next) {


    SkuModelObj.add(req.body)
        .then(result=>{
            res.json({
                success: true,
                message: 'Success',
            });
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json(err);
        })
    ;



});

router.get('/list',passport.authenticate('jwt', { session: false }), function(req, res, next) {
    SkuModelObj.all(req.query.limit,req.query.page )
        .then(result=>{
            SkuModelObj.count()
                .then(count=>{
                    res.json({
                        result:result,
                        count:(count[0] && count[0].total) ? count[0].total : 0,
                    });
                })
                .catch(err_count=>{
                    console.log(err);
                    res.status(500).json(err);
                })
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json(err);
        })
    ;
});

router.post('/change',  passport.authenticate('jwt', { session: false }), function(req, res, next) {

    SkuModelObj.change(req.body)
        .then(result=>{
            res.json({
                success: true,
                message: 'Success',
            });
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json(err);
        });



});
router.post('/delete',  passport.authenticate('jwt', { session: false }), function(req, res, next) {

    SkuModelObj.delete(req.body)
        .then(result=>{
            res.json({
                success: true,
                message: 'Success',
            });
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json(err);
        });



});


module.exports = router;