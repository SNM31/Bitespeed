import express from 'express';
import Contact from '../modals/Contact.js';

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
      return res.status(200).send("Contact already exists.");
    }

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
    res.status(201).json(responseObj);
  } catch (error) {
    console.error("Error occurred while processing request:", error);
    res.status(500).send("Internal server error");
  }
};
