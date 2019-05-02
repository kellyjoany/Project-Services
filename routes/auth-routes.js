const express = require('express');

const router = express.Router();

router.get('/login', (req, res, next) => {
  res.render('auth/login');
});

router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    // can't access session here
    res.redirect('index');
  });
});

module.exports = router;
