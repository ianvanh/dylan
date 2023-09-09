const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 3000;

// db
const { User, addUserKey, totalHit } = require("./data");

app.use(
  session({
    secret: "xix2j4av",
    resave: false,
    saveUninitialized: true,
  })
);

app.set('json spaces', 2);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  if (req.session && req.session.username) {
    res.redirect("/bot");
  } else {
    res.render("login");
  }
});
app.get('/lib/logo.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, '../lib/bot.jpg'));
});
app.get("/login", (req, res) => {
  if (req.session && req.session.username) {
    res.redirect("/bot");
  } else {
    res.render("login");
  }
});
app.get("/registro", (req, res) => {
  if (req.session && req.session.username) {
    res.redirect("/bot");
  } else {
    res.render("registro");
  }
});

app.post("/registro", async (req, res) => {
    const { username, password, number } = req.body;
    const valores = req.body
    const regUser = User.check(number+'@s.whatsapp.net');
    
   if (regUser === true) {
    return res.render("registro", {
      valores: valores,
      alert: true,
      icon: 'warning',
      tit: 'Error',
      msg: 'Usuario Existente!',
      conf: false,
      time: 1500,
      ruta: '',
    });
  } else if (username.length < 6) {
    return res.render('registro', {
      valores: valores,
      alert: true,
      icon: 'warning',
      tit: 'Error',
      msg: 'El nombre de usuario debe tener al menos 6 caracteres.',
      conf: false,
      time: 1500,
      ruta: '',
    });
  } else if (password.length < 6) {
    return res.render('registro', {
      valores: valores,
      alert: true,
      icon: 'warning',
      tit: 'Error',
      msg: 'La contraseña debe tener al menos 6 caracteres.',
      conf: false,
      time: 1500,
      ruta: '',
    });
  } else if (!/^\d+$/.test(number)) {
    return res.render('registro', {
      valores: valores,
      alert: true,
      icon: 'warning',
      tit: 'Error',
      msg: 'El número de telefono contiene carácteres no validos.',
      conf: false,
      time: 1500,
      ruta: '',
    });
  } else if (number.length <= 6) {
    return res.render('registro', {
      valores: valores,
      alert: true,
      icon: 'warning',
      tit: 'Error',
      msg: 'El número de telefono debe ser mayor a 6 caracteres.',
      conf: false,
      time: 1500,
      ruta: '',
    });
  } else {
    res.render("registro", {
      alert: true,
      icon: 'success',
      tit: 'Exito',
      msg: 'Usuario Guardaro!',
      conf: false,
      time: 1500,
      ruta: '/login'
    });
    new User(number+'@s.whatsapp.net', username, password)
    await client.sendMessage(number+'@s.whatsapp.net', {
      text: 'Bienvenido, te registraste desde la web\n'+
      'Tus credenciales son las siguientes:\n\n'+
      `*Usuario:*\n${username}\n`+
      `*Contraseña:*\n${password}`
    })
  }
});

app.post("/login", (req, res) => {
  const { number, password } = req.body;
  const valores = req.body;
  const checkUser = User.show(number+'@s.whatsapp.net');

  if (!checkUser) {
    return res.render("login", {
      valores: valores,
      alert: true,
      icon: 'warning',
      tit: 'Alerta',
      msg: 'Usuario no encontrado!',
      conf: false,
      time: 1500,
      ruta: ''
    });
  } else if (checkUser.pass !== password) {
    return res.render("login", {
      valores: valores,
      alert: true,
      icon: 'error',
      tit: 'Error',
      msg: 'Contraseña Incorrecta!',
      conf: false,
      time: 1500,
      ruta: ''
    });
  } else {
    req.session.username = checkUser.name;
    res.render("login", {
      alert: true,
      icon: 'success',
      tit: 'Exito',
      msg: 'Sesion Iniciada!',
      conf: false,
      time: 1500,
      ruta: '/bot'
    });
  }
});

function requireLogin(req, res, next) {
  if (req.session && req.session.username) {
    return next();
  } else {
    res.redirect("/");
  }
}

app.get("/bot", requireLogin, (req, res) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  let username = req.session.username;
  res.render("bot", { username });
});
app.get("/contacto", requireLogin, (req, res) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  let username = req.session.username;
  res.render("contact", { username });
});

app.get("/usuario", requireLogin, (req, res) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  let number = req.session.number;
  const checkUser = User.show(number+'@s.whatsapp.net');
  console.log(checkUser)
  //res.render("usuario");
  /*res.json({
    status : true,
    creator : `@ianvanh`,
    result : checkUser
  })*/
})

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
/*
app.use((req, res, next) => {
  res.status(404).sendFile(__dirname + '/public/404.html');
});
*/
app.listen(port, () => {
  console.log(`La aplicación está escuchando en el puerto ${port}`);
});