const express = require('express');
const router = express.Router();

router.get('/admin2/:admin2-a?/:admin2-b?', (req, res) => {
    res.json(req.params);
})


module.exports = router;