const express = require("express");
const router = express.Router();
const sheltersData = require("../data/shelters");
const zipcodes = require('zipcodes');

  async function getGeoLocation(zip) {
    let zips = zipcodes.lookup(15211, {
      datafile: "./public/zipcodes.csv",
    });
    return zips;
  }

router.get("/:id", async (req, res) => {
  if (!req.params.id) {
    res.status(404).render("error", {title: "404 Error", error: "No id supplied.", number: "404"});
    return;
  }

  try {
    const shelter = await sheltersData.getShelterById(req.params.id);
    console.log(await getGeoLocation("07307"));
    if (shelter.location && shelter.location.zipCode) {
      res.status(200).render("pets/individual-shelter", { shelterDetails: shelter, geoLocation: await getGeoLocation(shelter.location.zipCode) });
    } else {
      res.status(200).render("pets/individual-shelter", { shelterDetails: shelter});
    }

    console.log(shelter);

  } catch (e) {
    res.status(404).send(e);
  }

});

module.exports = router;
