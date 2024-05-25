import express from 'express';
import Contact from '../modals/Contact.js';
import { DATE, where } from 'sequelize';

export const identifyCustomer = async (req, res) => {
  try {
    const expectedKeys = ['email', 'phoneNumber'];

    // Check if sent payload contains expected keys only
    const keysAreValid = expectedKeys.every(key => req.body.hasOwnProperty(key));

    // If the keys do not match, send a 400 response with an error message
    if (!keysAreValid) {
      return res.status(400).send("The request payload must contain the keys: 'email' and 'phoneNumber'.");
    }

    const { email, phoneNumber } = req.body;
    console.log(`email: ${email} phoneNumber: ${phoneNumber}`)

    if (!email && !phoneNumber) {
      return res.status(400).send("Both email and phoneNumber cannot be null.");
    }

    let emailMatchedContacts;
    let phoneNumberMatchedContacts;

    if (email) {
      emailMatchedContacts = await Contact.findAll({
        where: {
          email: email,
        },
      });
    }

    if (phoneNumber) {
      phoneNumberMatchedContacts = await Contact.findAll({
        where: {
          phoneNumber: phoneNumber,
        },
      });
    }

    if (emailMatchedContacts.length > 0 || phoneNumberMatchedContacts.length > 0) {
      // Handle the case where the contact already exists
      if(emailMatchedContacts.length>0 && ! phoneNumberMatchedContacts.length>0)
      {
        console.log("Entered in correct block where data with emai!=null and phoneNumber==null");
        // need to iterate data for email and find for the oldest created data where email matches
        emailMatchedContacts.sort((a, b) => a.createdAt - b.createdAt);
         emailMatchedContacts.forEach(contact => {
            console.log("data: "+JSON.stringify(contact.toJSON()));
          });
        let allPhoneNumberInMatchedContacts=[]
        let secondaryContactIds =[]
        let primaryContact =(emailMatchedContacts[0].linkPrecedence==='primary') ? emailMatchedContacts[0] : await (Contact.findOne({ where :{id:emailMatchedContacts.find(contact => contact.linkedId !== null).linkedId }}))
        const emails=(primaryContact.email!=email) ? [primaryContact.email,email] : [email]
        allPhoneNumberInMatchedContacts.push(primaryContact.phoneNumber)
        console.log(`primaryContact: ${JSON.stringify(primaryContact.toJSON())}`)
        emailMatchedContacts.forEach(contact=>{
            if(contact.phoneNumber && primaryContact.phoneNumber!=contact.phoneNumber) allPhoneNumberInMatchedContacts.push(contact.phoneNumber)
            if(contact.linkPrecedence==='secondary') secondaryContactIds.push(contact.id)
        })
        if(phoneNumber) allPhoneNumberInMatchedContacts.push(phoneNumber)
        try{
          const customerContact = await Contact.create({
            email: email,
            phoneNumber: phoneNumber,
            linkPrecedence: 'secondary',
            linkedId: primaryContact.id
           });
           secondaryContactIds.push(customerContact.id)
           const responseObj={
           
            contact: {
                primaryContactId: primaryContact.id,
                emails: emails,
                phoneNumbers: allPhoneNumberInMatchedContacts,
                secondaryContactIds: secondaryContactIds,
              }, 
            }
            res.status(200).json(responseObj)
        }catch(error){
            console.error("Failed when Email Matched and PhoneNumber didn't")
            res.status(500).json("Internal Server Error");
        }
      }
      else if(!emailMatchedContacts.length>0 && phoneNumberMatchedContacts.length>0)
      {
        phoneNumberMatchedContacts.sort((a, b) => a.createdAt - b.createdAt);
        let allEmailInMatchedContacts=[]
        let secondaryContactIds =[]
        let primaryContact =(phoneNumberMatchedContacts[0].linkPrecedence==='primary') ? phoneNumberMatchedContacts[0] : await (Contact.findOne({ where :{id:phoneNumberMatchedContacts.find(contact => contact.linkedId !== null).linkedId }}))
        let phoneNumbers=(primaryContact.phoneNumber!=phoneNumber) ? [primaryContact.phoneNumber,phoneNumber]: [phoneNumber]
        allEmailInMatchedContacts.push(primaryContact.email)
        phoneNumberMatchedContacts.forEach(contact=>{
            if(contact.email && contact.email!=primaryContact.email) allEmailInMatchedContacts.push(contact.email)
            if(contact.linkPrecedence==='secondary') secondaryContactIds.push(contact.id)
        })
        if(email) allEmailInMatchedContacts.push(email)
        try{
          const customerContact = await Contact.create({
            email: email,
            phoneNumber: phoneNumber,
            linkPrecedence: 'secondary',
            linkedId: primaryContact.id
           });
           secondaryContactIds.push(customerContact.id)
           const responseObj={
           
            contact: {
                primaryContactId: primaryContact.id,
                emails: allEmailInMatchedContacts,
                phoneNumbers: phoneNumbers,
                secondaryContactIds: secondaryContactIds,
              }, 
            }
            res.status(200).json(responseObj)
        }catch(error){
            console.error("Failed when Email didn't Matched but PhoneNumber Matched")
            res.status(500).json("Internal Server Error");
        }
      }
      else
      {
         // moving to next case when both are matching to some recored in database may be same or different 
         // now if they are matching to same record then we need
         const orignalSecondaryContacts=[...emailMatchedContacts.filter(contact=>contact.linkPrecedence!=='primary'),...phoneNumberMatchedContacts.filter(contact=>contact.linkPrecedence!='primary')]
         const allPossiblePrimaryContacts = [
            ...emailMatchedContacts.filter(contact => contact.linkPrecedence === 'primary'),
            ...phoneNumberMatchedContacts.filter(contact => contact.linkPrecedence === 'primary')
          ]
          allPossiblePrimaryContacts.sort((a,b)=>a.createdAt-b.createdAt)
          const primaryContact=allPossiblePrimaryContacts[0]
          const secondayContacts=allPossiblePrimaryContacts.filter(contact=>contact.id!==primaryContact.id)
          // now update all remaining contacts as seconday
          try{
                        
             for (const contact of secondayContacts) {
                await Contact.update(
                  { linkPrecedence:'secondary', linkedId:primaryContact.id },
                  { where: { id: contact.id } }
                );
              }
          }catch(error){
                console.error('error while in updating primary records to secondary')
                res.status(500).send("Internal Server Error")
          }
          // now need to get all email and phoneNumber and secondayContactIds
          const secondaryContactIds = secondayContacts.map(contact => contact.id)

          const emails = [primaryContact.email,...orignalSecondaryContacts.map(contact=>contact.phoneNumber), ...secondayContacts.map(contact => contact.email)]

          const phoneNumbers = [primaryContact.phoneNumber,...orignalSecondaryContacts.map(contact=>contact.phoneNumber), ...secondayContacts.map(contact => contact.phoneNumber)] 
          
          const responseObj={
            contacts:{
                primaryContactId:primaryContact.id,
                emails:emails,
                phoneNumbers:phoneNumbers,
                secondaryContactIds:secondaryContactIds
            }
          }
          res.status(200).json(responseObj)
      }
    }
    else{
    // Create a new contact
    const customerContact = await Contact.create({
      email: email,
      phoneNumber: phoneNumber,
      linkPrecedence: 'primary',
    });

    // Construct the response object
    const responseObj = {
      contact: {
        primaryContactId: customerContact.id,
        emails: [customerContact.email],
        phoneNumbers: [customerContact.phoneNumber],
        secondaryContactIds: [],
      },
    };

    // Send the response as JSON
    res.status(200).json(responseObj);
}
  } catch (error) {
    console.error("Error occurred while processing request:", error);
    res.status(500).send("Internal server error");
  }
};
