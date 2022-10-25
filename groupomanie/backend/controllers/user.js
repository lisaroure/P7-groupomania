require("dotenv").config({ path: "./config/.env" });
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AdminMdl = require("../models/Admin");

const Admin = {
  pseudo: "Admin",
  email: "admin@email.fr",
  password: "coucouadmin"
}

//Créer un compte
exports.signup = (req, res) => {
  console.log(req.body);
  if (
    req.body.pseudo === Admin.pseudo &&
    req.body.email === Admin.email &&
    req.body.password === Admin.password
  ) {
    bcrypt.hash(req.body.password, 10)
      .then((hash) => {
        const admin = new AdminMdl({
          pseudo: req.body.pseudo,
          email: req.body.email,
          password: hash,
        });
        admin.save()
          .then(() => res.status(201).json({ message: "Admin created" }))
          .catch((err) => res.status(400).json({ err }));
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ err });
      });
  } else {
    bcrypt.hash(req.body.password, 10)
      .then((hash) => {
        const user = new User({
          pseudo: req.body.pseudo,
          email: req.body.email,
          password: hash,
        });
        user.save()
          .then(() => res.status(201).json({ message: "User created" }))
          .catch((err) => res.status(500).json({ err }));
      });
  }
};

//Connexion
exports.login = (req, res) => {
  if (
    req.body.email === Admin.email &&
    req.body.password === Admin.password
  ) {
    AdminMdl.findOne({ email: req.body.email })
      .then((admin) => {
        if (!admin) {
          return res.status(401).json({ message: "Login ou mot de passe incorrect" });
        }
        bcrypt
          .compare(req.body.password, admin.password)
          .then((valid) => {
            if (!valid) {
              return res.status(401).json({ message: "Login ou mot de passe incorrect" });
            } else {
              res.status(200).json({
                adminId: admin._id,
                token: jwt.sign(
                  { adminId: admin._id },
                  process.env.RANDOM_TOKEN_SECRET,
                  { expiresIn: "1 hour" }
                ),
              });
            }
          })
          .catch((err) => res.status(500).json({ err }));
      })
      .catch((err) =>
        res.status(500).json(console.log("Erreur serveur"), { err })
      );
  } else {
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          return res
            .status(401)
            .json({ error: "Identifiant ou mot de passe incorrect" });
        }
        bcrypt
          .compare(req.body.password, user.password)
          .then((valid) => {
            if (!valid) {
              return res
                .status(401)
                .json({ error: "Identifiant ou mot de passe incorrect" });
            } else {
              res.status(200).json({
                userId: user._id,
                token: jwt.sign({ userId: user._id }, process.env.RANDOM_TOKEN_SECRET, {
                  expiresIn: "24h",
                }),
              });
            }
          })
          .catch((err) => res.status(500).json({ err }));
      })
      .catch((err) => res.status(500).json({ err }));
  }
};

//Afficher tous les users
exports.getAllUsers = (req, res) => {
  User.find()
    .then((users) => res.json({ data: users }))
    .catch((err) =>
      res.status(500).json({ message: "Database Error", error: err })
    );
};

//Afficher un seul user
exports.getUser = (req, res) => {
  User.findOne({ where: { _id: req.params.id } })
    .then((user) => res.status(200).json(user))
    .catch((err) =>
      res.status(400).json({ message: "Missing parameter", error: err }));
}

//Afficher l'admin
exports.getAdmin = (req, res) => {
  if (req.params.id === req.auth.adminId) {
    AdminMdl.findOne({ _id: req.params.id }).select('pseudo')
      .then((admin) => res.status(200).json(admin))
      .catch(error => res.status(400).json({ error }));
  }
}

// Modifier un user 
exports.modifyUser = async (req, res) => {
  if (req.file) {

    User.findOne({ _id: req.params.id })
      // Pour supprimer l'image dans le dossier images
      .then(imageUrl => {

        const fileName = imageUrl.picture.split('/images')[1];
        fs.unlink(`images/${fileName}`, (error) => {
          if (error) res.status(200);
        })
      })
  }
  const pictureUpdate = req.file ? {
    ...(req.body.user),
    picture: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  User.updateOne({ ...pictureUpdate, pseudo: req.body.pseudo }, { where: { _id: req.params.id } })
    .then(() => res.status(200).send({ message: "modification ok" }))
    .catch((err) => res.status(500).json(err))
}

// Supprimer un utilisateur
exports.deleteUser = (req, res) => {
  let userId = parseInt(req.params.id)

  // Vérification si le champ id est présent et cohérent
  if (!userId) {
    return res.status(400).json({ message: 'Missing parameter' })
  }

  // Suppression de l'utilisateur
  User.destroy({ where: { _id: userId }, force: true })
    .then(() => res.status(204).json({}))
    .catch(err => res.status(500).json({ message: 'Database Error', error: err }))
}


