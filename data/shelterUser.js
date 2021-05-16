const mongoCollections = require("../config/mongoCollections");
const { ObjectId } = require("mongodb").ObjectId;
const bcrypt = require("bcrypt");
const saltRounds = 16;
const petOwnerData = mongoCollections.petOwner;
const shelterAndRescueData = mongoCollections.shelterAndRescue;
const petData = mongoCollections.pets;
const zipcodes = require("zipcodes");
const axios = require("axios").default;

//validates email
function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

//returns a petOwner user searches by petOwner Email/Username
async function getPetShelterByEmail(shelterEmail) {
  try{
    if (shelterEmail === undefined || shelterEmail.trim() === ""){
      throw {
        status: 400,
        error: "Email must be provided. Generated by /data/shelterUser/getPetShelterByEmail",
      }
    }

     if (!validateEmail(shelterEmail)) {
      throw {
        status: 400,
        error:
          "E-Mail not in correct format. Generated by /data/shelterUser/getPetShelterByEmail",
      };
    }

    const sheltersCollection = await shelterAndRescueData();

    const shelterDetails = await sheltersCollection.findOne({ email: shelterEmail });

    if (shelterDetails == null || !shelterDetails) throw {status:404, error: "shelter User not found. Generated by /data/shelterUser/getPetShelterByEmail"};

    // return _id as string
    shelterDetails._id = shelterDetails._id.toString();

    return shelterDetails;

  }catch(e){
    throw { status: e.status, error:e.error}
  }
    
}

//returns updated shelter data
async function updateShelter(updatedData, email) {

    if (email === undefined || email.trim() === ""){
      throw {
        status: 400,
        error: "Email must be provided. Generated by data/shelterUsers/updateShelter",
      }
    }

     if (!validateEmail(email)) {
      throw {
        status: 400,
        error:
          "E-Mail not in correct format. Generated by data/shelterUsers/updateShelter",
      };
    }

    if(!updatedData.name || !updatedData.phoneNumber || !updatedData.location.hasOwnProperty("streetAddress1") ||
    !updatedData.location.hasOwnProperty("city") || !updatedData.location.hasOwnProperty("stateCode") || !updatedData.location.hasOwnProperty("zipCode") )
      throw {status: 404, error: "One of the mandatory fields is missing. Generated by data/shelterUsers/updateShelter"};

      if (updatedData.location.zipCode){
        if (zipcodes.lookup(updatedData.location.zipCode) === undefined) {
          throw {status : 400, error: "Invalid zip code . Generated by data/shelterUsers/updateShelter "}
        }
      }

      if(updatedData.name == undefined || updatedData.name.trim() == ""){
        throw {status:400, error: "invalid name. Generated by data/shelterUsers/updateShelter"}
      }

      if(updatedData.phoneNumber == undefined || updatedData.phoneNumber.trim() == ""){
        throw {status:400, error: "invalid phoneNumber. Generated by data/shelterUsers/updateShelter"}
      }

      if(updatedData.location.streetAddress1 == undefined || updatedData.location.streetAddress1.trim() == ""){
        throw {status:400, error: "invalid streetAddress1. Generated by data/shelterUsers/updateShelter"}
      }

      if(updatedData.location.city == undefined || updatedData.location.city.trim() == ""){
        throw {status:400, error: "invalid city. Generated by data/shelterUsers/updateShelter"}
      }

      if(updatedData.location.stateCode == undefined || updatedData.location.stateCode.trim() == ""){
        throw {status:400, error: "invalid statecode. Generated by data/shelterUsers/updateShelter"}
      }

      if(updatedData.location.zipCode == undefined || updatedData.location.zipCode.trim() == ""){
        throw {status:400, error: "invalid zipCode. Generated by data/shelterUsers/updateShelter"}
      }

      try {
        const { data } = await axios.get(
          encodeURI(
            `https://us-street.api.smartystreets.com/street-address?auth-id=33470d7f-96b9-3696-5112-d370eef1e36f&auth-token=FWi7nSCzrbUQmPsX5rGe&street=${updatedData.location.streetAddress1}&street2=${updatedData.location.streetAddress2}&city=${updatedData.location.city}&state=${updatedData.location.stateCode}&zipcode=${updatedData.location.zipCode}`
          )
        );
        // console.log("data");
        // console.log(data);
        if (data.length === 0) {
          throw {
            status:400,
            error: "Invalid Address. Generated by /data/shelterUser/updateShelter. "
          }
        }
      } catch (e) {
        throw {
          status: 500,
          error: "Axios call failed '/routes/shelterUser.js'.",
        };
      }
      
      const phoneNumberRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;  //regex to check phone Number
  
      if (updatedData.phoneNumber){
        if(!phoneNumberRegex.test(updatedData.phoneNumber)){
          throw {status : 400, error: "Invalid phone number . Generated by data/shelterUsers/updateShelter  "}
        }
      }
    
    const sheltersCollection = await shelterAndRescueData();

    const userDetails = await getPetShelterByEmail(email);

    const updateInfo = await sheltersCollection.updateOne(
      { _id: ObjectId(userDetails._id) },
      { $set: updatedData }
    );

    if (updateInfo.matchedCount === 0 && updateInfo.modifiedCount === 0)
      throw {status:500, error:"Could not update shelter.Generated by /data/shelterUser/updateShelter",}
     
    return await getShelterById(userDetails._id);
  }

// return a petOwner searches by pet Owner id
async function getShelterById(shelterId) {

  try{
      //checking petOwnerId
      if (!ObjectId.isValid(shelterId)) {
        throw {
          status: 400,
          error: "Invalid shelterUser id. Generated by Generated by /data/shelterUser/getShelterById",
        }
      }

      if(!shelterId){
        throw {
          status: 400,
          error: "Invalid shelterUser id. Generated by Generated by /data/shelterUser/getShelterById",
        }
      }

      const sheltersCollection = await shelterAndRescueData();

      const shelterUserDetails = await sheltersCollection.findOne({
        _id: ObjectId(shelterId),
      });

      if (shelterUserDetails == null || !shelterUserDetails) 
      throw {
        status: 404,
        error: "Shelter not found. Generated by Generated by /data/shelterUser/getShelterById",
      };

      return shelterUserDetails;
  }catch(e){
    throw { status: e.status, error: e.error}
  }
  
}

async function updatePassword(userId, plainTextPassword){

    try{
       //check for type of ID and password
       if (!userId) {
        throw {status: 400, error: "User id must be provided. Generated by /data/shelterUser/updateShelterProfileImage" };
      }
      if (!ObjectId.isValid(userId)) {
        throw {
          status: 400,
          error: "Invalid shelterUser id. Generated by Generated by /data/shelterUser/updateShelterProfileImage",
        }
      }
      if (!plainTextPassword) {
        throw {status: 400, error: "password must be provided.Generated by /data/shelterUser/updateShelterProfileImage" };
      }

      if (plainTextPassword.trim().length < 6) {
        throw {status: 400, error: "Password must contain at least 6 characters. Generated by /data/shelterUser/updateShelterProfileImage" };
      }
  
      const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
      const sheltersCollection = await shelterAndRescueData();
  
      const updateInfo = await sheltersCollection.updateOne(
        {_id: ObjectId(userId)},
        {$set: {"password": hashedPassword}}
      );
  
      if (updateInfo.matchedCount === 0 && updateInfo.modifiedCount === 0)
        throw {status:500, error:"Could not update password.Generated by /data/shelterUser/updateShelterProfileImage",}
  
      return await getShelterById(userId);
    }catch(e){
      throw { status: e.status, error: e.error}
    }
   
}

async function updateShelterProfileImage(email, picture){
  try{

    if (email === undefined || email.trim() === ""){
      throw {
        status: 400,
        error: "Email must be provided. Generated by /data/shelterUser/updateShelterProfileImage",
      }
    }

     if (!validateEmail(email)) {
      throw {
        status: 400,
        error:
          "E-Mail not in correct format. Generated by /data/shelterUser/updateShelterProfileImage",
      };
    }
    if (!picture || picture.trim() == "") throw {
      status: 400,
      error:
        "profile picture must be provided. Generated by /data/shelterUser/updateShelterProfileImage",
    };
    
    const userDetails = await getPetShelterByEmail(email);
   
    const sheltersCollection = await shelterAndRescueData();
    const updateInfo = await sheltersCollection.updateOne(
      {_id: ObjectId(userDetails._id)},
      {$set: {"profilePicture": picture}}
    );
   
    if (updateInfo.matchedCount === 0 && updateInfo.modifiedCount === 0)
      throw {status:500, error:"Could not update profile picture.Generated by /data/shelterUser/updateShelterProfileImage",}
    
    return await getShelterById(ObjectId(userDetails._id));  
  }catch(e){
    throw { status: e.status, error: e.error}
  }
  
}

async function getAvailablePets(availablePetsArray){

  // for (let i=0; i < availablePetsArray.length; i++)
  //   console.log(availablePetsArray[i]);
  try{
    if (!Array.isArray(availablePetsArray)){
      throw{
        status: 400,
        error: "availablePetsArray is not array. generated by /data/shelterUser/getAvailablePets"
      }
    } 
    const petCollection = await petData();
    let availablePetsDetails = [];

    for (let index = 0; index < availablePetsArray.length; index++){
      const petDetails = await petCollection.findOne({_id: ObjectId(availablePetsArray[index])});
      
      if (petDetails == null) {
        throw {
          status:404,
          error: "Pet not found. generated by /data/shelterUser/getAvailablePets"
        }
      }

      availablePetsDetails.push({
        name: petDetails.petName,
        profilePicture: petDetails.petPictures[0]
      });
    }
    return availablePetsDetails;
  }catch(e){
    throw { status: e.status, error: e.error}
  }
  
}

//returns the pet name and profile picture. petsIdArray is a list if pet ids either available for adoption or already adopted
async function getPetsData(petsIdArray){
  try{
    if (!Array.isArray(petsIdArray)){
      throw{
        status: 400,
        error: "PetsIdArray is not array. generated by /data/shelterUser/getPetsData"
      }
    }
    const petCollection = await petData();
    let petsDetails = [];
  
    for (let index = 0; index < petsIdArray.length; index++){
      const petInfo = await petCollection.findOne({_id: ObjectId(petsIdArray[index])});
      
      if (petInfo == null) {
        throw {
          status:404,
          error: "Pet not found. generated by /data/shelterUser/getPetsData"
        }
      }
  
      petsDetails.push({
        name: petInfo.petName,
        profilePicture: petInfo.petPictures[0]
      });
    }
    return petsDetails;
  }catch(e){
    throw { status: e.status, error: e.error}
  }
 
}

async function getReviews(reviewsIdArray){
  try{
    if (!Array.isArray(reviewsIdArray)){
      throw{
        status: 400,
        error: "Reviews is not array. generated by /data/shelterUser/getReviews"
      }
    }

    let reviewData = [];
      for (let index = 0; index < reviewsIdArray.length; index++){
          const petOwnerCollection = await petOwnerData();
          const petOwnerInfo = await petOwnerCollection.findOne({_id:ObjectId(reviewsIdArray[index].reviewer)});
          if  (petOwnerInfo == null) {
            throw {
              status:404,
              error: "Reviewer not found. generated by /data/shelterUser/getReviews"
            }
          }
          reviewData.push({
            rating: reviewsIdArray[index].rating,
            reviewerName: petOwnerInfo.fullName.firstName + " "+ petOwnerInfo.fullName.lastName,
            reviewBody: reviewsIdArray[index].reviewBody,
            reviewDate: reviewsIdArray[index].reviewDate
          });
      }
      return reviewData;
  }catch(e){
    throw { status: e.status, error: e.error}
  }
  
}

module.exports = {
  updatePassword,
  getPetShelterByEmail,
  updateShelter,
  getShelterById,
  updateShelterProfileImage,
  getReviews,
  getPetsData,
  getAvailablePets
};
