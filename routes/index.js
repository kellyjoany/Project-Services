const express = require('express');

const router = express.Router();
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const nodemailer = require('nodemailer');

const bcryptSalt = 10;

const Manager = require('../models/Manager.js');
const Stores = require('../models/Stores.js');
const User = require('../models/User.js');
const Schedules = require('../models/Schedules.js');

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAILUSER,
    pass: process.env.PASSWORD,
  },
});

/* GET home page */
router.get('/', (req, res, next) => {
  Manager.find()
    .then((results) => {
      res.render('index', { st: results });
    })
    .catch((err) => {
      throw new Error(err);
    });
});

router.post('/schedule', (req, res, next) => {
  const { idManag } = req.body;
  Manager.findById(idManag)
    .then((results) => {
      Stores.find({ _id: results.stores })
        .then((resAdress) => {
          res.render('schedule', { address: resAdress });
        })
        .catch((err) => {
          throw new Error(err);
        });
    })
    .catch((err) => {
      throw new Error(err);
    });
});

router.post('/showSchedules', (req, res, next) => {
  const { idStoreSchedule } = req.body;
  Stores.findById(idStoreSchedule)
    .populate('schedules')
    .then((schResults) => {
      res.render('index', { sch: schResults });
    })
    .catch((err) => {
      throw new Error(err);
    });
});

router.get('/auth/login', (req, res, next) => {
  res.render('auth/login');
});

router.post('/auth/login', (req, res, next) => {
  const { username, password } = req.body;
  if (username === '' || password === '') {
    res.render('auth/login', {
      errorMessage: 'Indique um login e uma senha para entrar.',
    });
    return;
  }
  User.findOne({ username })
    .then((user) => {
      if (!user) {
        Manager.findOne({ username })
          .then((manager) => {
            if (!manager) {
              res.render('auth/login', {
                errorMessage: 'O usuário não existe.',
              });
              return;
            }
            if (bcrypt.compareSync(password, manager.password)) {
              // Save the login in the session!
              req.session.currentUser = manager;
              res.redirect('../manager/painel');
            } else {
              res.render('auth/login', {
                errorMessage: 'senha incorreta',
              });
            }
          })
          .catch((error) => {
            next(error);
          });
      }
      if (bcrypt.compareSync(password, user.password)) {
        // Save the login in the session!
        req.session.currentUser = user;
        res.redirect('../user/painel');
      } else {
        res.render('auth/login', {
          errorMessage: 'senha incorreta',
        });
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/auth/signup', (req, res, next) => {
  res.render('auth/signup');
});

router.post('/auth/signup', (req, res, next) => {
  const { name, email, username, password, profile, nameStore } = req.body;
  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);
  if (profile === '2') {
    const newManager = new Manager({ name, email, username, password: hashPass, profile, nameStore });
    newManager.save()
      .then(() => {
        res.redirect('login');
      })
      .catch((err) => {
        throw new Error(err);
      });
  } else {
    const newUser = new User({ name, email, username, password: hashPass, profile });
    newUser.save()
      .then(() => {
        res.redirect('login');
      })
      .catch((err) => {
        throw new Error(err);
      });
  }
});

// ////////private pages/////////////

router.use((req, res, next) => {
  if (req.session.currentUser) { // <== if there's user in the session (user is logged in)
    next(); // ==> go to the next route ---
  } else { //    |
    res.redirect('/auth/login'); //    |
  } //    |
}); // ------------------------------------
//     |
//     V

router.get('/painel', (req, res, next) => {
  const profile = req.session.currentUser.profile;
  if (profile === '1') {
    res.redirect('user/painel');
  } else {
    res.redirect('manager/painel');
  }
});

router.get('/manager/painel', (req, res, next) => {
  const idManagerPainel = req.session.currentUser._id;
  Manager.findById(idManagerPainel)
    .populate('stores')
    .then((response) => {
      res.render('manager/painel', { registredStores: response });
    })
    .catch((err) => {
      throw new Error(err);
    });
});

router.get('/manager/painel/:storeId', (req, res, next) => {
  Schedules.deleteMany({ stores: req.params.storeId })
    .then(() => {
      Stores.findByIdAndDelete(req.params.storeId)
        .then(() => {
          res.redirect('/manager/painel');
        })
        .catch((err) => {
          throw new Error(err);
        });
    })
    .catch((err) => {
      throw new Error(err);
    });
});

router.get('/manager/store', (req, res, next) => {
  res.render('manager/addStore');
});

router.get('/manager/store/edit/:storeId', (req, res, next) => {
  Stores.findById({ _id: req.params.storeId })
    .then((editS) => {
      res.render('manager/editStore', { editStore: editS });
    })
    .catch((err) => {
      throw new Error(err);
    });
});

router.post('/manager/painel/edited', (req, res, next) => {
  const { idEditStore, nameEdit, addressEdit, numberEdit, districtEdit, cityEdit, stateEdit, zipCodeEdit } = req.body;
  Stores.findByIdAndUpdate(idEditStore, { $set: { name: nameEdit, address: addressEdit, number: numberEdit, district: districtEdit, city: cityEdit, state: stateEdit, zipCode: zipCodeEdit } })
    .then(() => {
      res.redirect('/manager/painel');
    })
    .catch((err) => {
      throw new Error(err);
    });
});

router.get('/user/painel', (req, res, next) => {
  const idUserPainel = req.session.currentUser._id;
  Schedules.find({ user: idUserPainel })
    .populate('stores').sort({ bookingDay: 'desc' })
    .then((response) => {
      res.render('user/painel', { stores: response });
    })
    .catch((err) => {
      throw new Error(err);
    });
});

router.get('/user/painel/:scheduleId', (req, res, next) => {
  Schedules.findByIdAndDelete(req.params.scheduleId)
    .then(() => {
      res.redirect('/user/painel');
    })
    .catch((err) => {
      throw new Error(err);
    });
});

router.get('/user/agendardata/edit/:scheduleId', (req, res, next) => {
  Schedules.findById({ _id: req.params.scheduleId })
    .then((editSchedule) => {
      res.render('user/editScheduleDate', { edit: editSchedule });
    })
    .catch((err) => {
      throw new Error(err);
    });
});

router.get('/user/agendar', (req, res, next) => {
  Manager.find()
    .then((results) => {
      res.render('user/addSchedule', { st: results });
    })
    .catch((err) => {
      throw new Error(err);
    });
});

router.post('/user/painel/edited', (req, res, next) => {
  const { idEditSchedule, dateEdit, hourEdit } = req.body;
  Schedules.findByIdAndUpdate(idEditSchedule, { $set: { bookingDay: dateEdit, bookingHour: hourEdit } })
    .then(() => {
      res.redirect('/user/painel');
    })
    .catch((err) => {
      throw new Error(err);
    });
});

router.post('/user/agendardata', (req, res, next) => {
  const { idMan } = req.body;
  Manager.findById(idMan)
    .then((results) => {
      Stores.find({ _id: results.stores })
        .then((resAdress) => {
          res.render('user/addScheduleDate', { address: resAdress });
        })
        .catch((err) => {
          throw new Error(err);
        });
    })
    .catch((err) => {
      throw new Error(err);
    });
});

router.post('/user/painel', (req, res, next) => {
  const { idStore, date, hour } = req.body;
  const idUser = req.session.currentUser._id;
  const emailUser = req.session.currentUser.email;
  const newSchedule = new Schedules({ stores: idStore, user: idUser, bookingDay: date, bookingHour: hour });
  const idSchedule = newSchedule._id;
  newSchedule.save()
    .then(() => {
      Stores.findByIdAndUpdate({ _id: idStore }, { $push: { schedules: idSchedule } })
        .then(() => {
          Stores.findById(idStore)
            .then((storeR) => {
              const storeAddress = storeR.address;
              const storeNumber = storeR.number;
              const storeCity = storeR.city;
              const storeState = storeR.state;
              let link = `https://maps.google.com/?q=${storeAddress},${storeNumber},${storeCity},${storeState}`;
              link = link.replace(/\s/g, '-');
              User.findByIdAndUpdate({ _id: idUser }, { $push: { schedules: idSchedule } })
                .then(() => {
                  const idUserPainelPost = req.session.currentUser._id;
                  Schedules.find({ user: idUserPainelPost })
                    .populate('stores')
                    .then((response) => {
                      if (emailUser !== '') {
                        transporter.sendMail({
                          from: '"Schedules Services',
                          to: emailUser,
                          subject: 'Confirmation Schedule',
                          text: 'Your schedule was confirmed! Thank you for your time :)',
                          html: `Your schedule was confirmed at ${hour} in the ${date}! Thank you for your time :)</br>
                                you can use the <b><a href=${link}>Store Localization</a></b>`,
                        });
                      }
                      res.render('user/painel', { stores: response });
                    })
                    .catch((err) => {
                      throw new Error(err);
                    });
                })
                .catch((err) => {
                  throw new Error(err);
                });
            })
            .catch((err) => {
              throw new Error(err);
            });
        })
        .catch((err) => {
          throw new Error(err);
        });
    })
    .catch((err) => {
      throw new Error(err);
    });
});

router.post('/manager/store', (req, res, next) => {
  const { name, address, number, district, city, state, zipCode } = req.body;
  const newStores = new Stores({ name, address, number, district, city, state, zipCode });
  const idStores = newStores._id;
  const idManager = req.session.currentUser._id;
  newStores.save()
    .then(() => {
      Manager.findByIdAndUpdate({ _id: idManager }, { $push: { stores: idStores } })
        .then(() => {
          res.redirect('/manager/painel');
        })
        .catch((err) => {
          throw new Error(err);
        });
    })
    .catch((err) => {
      throw new Error(err);
    });
});

router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect('index');
  });
});

router.get('/api/:stId', (req, res, next) => {
  Stores.findById(req.params.stId)
    .populate('schedules')
    .then((resultHour) => {
      res.send(resultHour);
    })
    .catch((err) => {
      throw new Error(err);
    });
});

module.exports = router;
