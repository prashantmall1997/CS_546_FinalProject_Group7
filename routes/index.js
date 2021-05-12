const homepage = require("./homepage");
const petOwnerRoute = require("./petOwner");
const petsRoute = require("./pets");
const shelterRoute = require("./sheltersAndRescue");

const messagesRoute = require("./messages");

const feedbackRoutes = require('./feedback');
const helpPageRoutes = require('./helppage');
const shelterUserRoute = require('./shelterUser');


const constructorMethod = (app) => {
  app.use("/", homepage);
  app.use("/petOwner", petOwnerRoute);
  app.use("/pets", petsRoute);

  app.use("/shelters", shelterRoute);
  app.use("/messages", messagesRoute);

  // All other URLs will return a 404 Error
  app.use("*", (req, res) => {
    res.status(404).json({ error: "Not found" }); // todo would we rather redirect to home?

 
  app.use('/helppage', helpPageRoutes);
  app.use('/feedback', feedbackRoutes);
  app.use('/shelterUser', shelterUserRoute);

  // All other URLs will return a 404 Error
  app.use("*", (req, res) => {
    // res.status(404).json({ error: "Not found" });
    res.redirect("/");

  });
};

module.exports = constructorMethod;
