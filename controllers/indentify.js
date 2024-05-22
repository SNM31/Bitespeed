import express from 'express'

export const identifyCustomer=async(req,res)=>{
  try{
    console.log('code reached in Error block');
    const expectedKeys = ['email', 'phoneNumber'];

    // to check if sent payload contains expected keys only
    const keysAreValid = expectedKeys.every(key => req.body.hasOwnProperty(key));
  
    // If the keys do not match, send a 400 response with an error message
    if (!keysAreValid) {
      return res.status(400).send("The request payload must contain the keys: 'email' and 'phoneNumber'.");
    }
      const {email,phoneNumber}=req.body
      if(!email && !phoneNumber){
        return res.status(400).send("Both email and phoneNumber cannot be Null");
      }

  }catch(error){

  }
}