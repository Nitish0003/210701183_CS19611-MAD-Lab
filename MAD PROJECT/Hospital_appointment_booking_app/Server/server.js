const express = require('express');
// const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5000;

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'sairam23@',
  database: 'TEST_HOSPITAL',
});

const SECRET_KEY = 'DHANUSH@10578AVDHJRUJ@12345VILLUPURAM';

app.use(cors());
// app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended:true}));



app.post('/signup', async (req, res) => {
  try {
    const { name, phoneNumber, password } = req.body;

    // Perform basic validation (you should add more robust validation)
    if (!name || !phoneNumber || !password) {
      return res.status(400).json({ message: 'Incomplete information provided' });
    }

    // Check if the user with the provided phone number already exists
    const existingUserQuery = 'SELECT * FROM patient WHERE CONTACT_NUMBER = ?';
    const [existingUserResults] = await db.query(existingUserQuery, [phoneNumber]);

    if (existingUserResults.length > 0) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const insertUserQuery = 'INSERT INTO patient (PATIENT_NAME, CONTACT_NUMBER, PASSWORD) VALUES (?, ?, ?)';
    await db.query(insertUserQuery, [name, phoneNumber, hashedPassword]);

    // Respond with a success message
    res.status(200).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/login', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({ message: 'Phone number and password are required' });
    }

    const selectQuery = 'SELECT * FROM patient WHERE CONTACT_NUMBER = ?';
    const [userResults] = await db.query(selectQuery, [phoneNumber]);

    if (userResults.length === 0) {
      return res.status(401).json({ message: 'Phone number not found. Please sign up.' });
    }

    const user = userResults[0];
    const passwordMatch = await bcrypt.compare(password, user.PASSWORD);

    // if (!passwordMatch) {
    //   return res.status(401).json({ message: 'Invalid password' });
    // }
        console.log(user.CONTACT_NUMBER);
   const token = jwt.sign({phoneNumber: user.CONTACT_NUMBER }, SECRET_KEY, {
      expiresIn: '6h', 
    });
    

    console.log('Login successful');
    console.log(token);
    res.status(200).json({ message: 'Login successful', token });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




app.get('/api/hospitals', async(req, res) => {
  try {
    // Using the connection pool to execute queries
    const [rows] = await db.query('SELECT * FROM hospital');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Fetch doctors based on hospitalId
app.get('/api/doctors/:hospitalId', async (req, res) => {
  try {
    const hospitalId = req.params.hospitalId;
    const query = `
      SELECT DOCTOR_ID, DOCTOR_NAME
      FROM doctor
      WHERE HOSPITAL_ID = ${hospitalId}`;
    
    const [results] = await db.query(query);
    res.json(results);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch specialization IDs based on doctorId
app.get('/api/doctor_specialization_mapping/:doctorId', async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const query = `
      SELECT SPECIALIZATION_ID
      FROM doctor_specialization_mapping
      WHERE DOCTOR_ID = ${doctorId}`;

    const [results] = await db.query(query);
    const specializationIds = results.map(result => result.SPECIALIZATION_ID);
    res.json(specializationIds);
  } catch (error) {
    console.error('Error fetching specialization IDs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch specialization details based on specialization IDs
app.get('/api/specializations', async (req, res) => {
  try {
    const specializationIds = req.query.ids.split(',').map(id => parseInt(id));
    const query = `
      SELECT SPECIALIZATION_ID, SPECIALIZATION_NAME
      FROM specialization
      WHERE SPECIALIZATION_ID IN (${specializationIds.join(',')})`;

    const results = await db.query(query);
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching specializations:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




//TO FETCH THE BOOKABLE SLOTS (12 HOURS FROM CURRENT TIME)
app.get('/api/slots', async (req, res) => {
  try {
    const  DOCTOR_ID  = req.query.doctorId;
    console.log(DOCTOR_ID);

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = `${hours}:${minutes}`;
    const todayRemainingTime = calculateRemainingTime(currentTime, '24:00');

    const query = `
      SELECT *
      FROM SLOT
      WHERE DOCTOR_ID = ? AND DAY_OF_WEEK = ? AND OP_START_TIME >= ? AND OP_START_TIME <= ?`;

    let slots = [];

    if (todayRemainingTime > 12 * 60) {
      // If remaining time is greater than 12 hours, fetch today's slots within the next 12 hours
      const [todaySlots] = await db.query(query, [DOCTOR_ID, today, currentTime, addTime(currentTime, 12 * 60)]);
      slots = slots.concat(todaySlots);
    } else {
      // If remaining time is less than or equal to 12 hours, fetch today's slots within the remaining time
      const tomorrowRemainingTime = 12 * 60 - todayRemainingTime;
      const [todaySlots] = await db.query(query, [DOCTOR_ID, today, currentTime, '24:00']);
      slots = slots.concat(todaySlots);

      // Fetch tomorrow's slots within the remaining time
      const [tomorrowSlots] = await db.query(query, [DOCTOR_ID, tomorrow, '00:00', addTime('00:00', tomorrowRemainingTime)]);
      slots = slots.concat(tomorrowSlots);
    }

    console.log("SLOTS WITHIN NEXT 12 HOURS IS FETCHED SUCCESSFULLY");
    // console.log([slots]);
    //  const slotsData = slots[0];

    res.status(200).json( slots );
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



function calculateRemainingTime(startTime, endTime) {
  const start = new Date(`01/01/2000 ${startTime}`);
  const end = new Date(`01/01/2000 ${endTime}`);
  const diff = end - start;
  return diff / (60 * 1000); // Convert milliseconds to minutes
}
function addTime(startTime, minutesToAdd) {
  const start = new Date(`01/01/2000 ${startTime}`);
  const end = new Date(start.getTime() + minutesToAdd * 60 * 1000);
  return end.toLocaleTimeString('en-US', { hour12: false });
}




app.use((req, res, next) => {
  const token = req.header('Authorization');
  console.log('Received token:', token);

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  const tokenWithoutBearer = token.replace(/^Bearer\s/, '');
  jwt.verify(tokenWithoutBearer, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error('Error verifying token:', err);
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    console.log('Decoded token:', decoded);
    
    req.user = decoded; // Attach user information to the request object
    console.log('User information:', req.user);
    console.log(req.user.phoneNumber);
    console.log('Middleware executed successfully');
    next(); // Continue with the next middleware or route handler
  });
});


app.post('/book-slot', async (req, res) => {
  try {
    const { docSlotId, doctorId, hospitalId } = req.body;
    console.log(hospitalId);
    const phoneNumber = req.user.phoneNumber;
    const selectPatientIdQuery = 'SELECT PATIENT_ID FROM patient WHERE CONTACT_NUMBER = ?';
    const [patientResults] = await db.query(selectPatientIdQuery, [phoneNumber]);

    if (patientResults.length === 0) {
      return res.status(401).json({ message: 'Patient not found' });
    }

    const patientId = patientResults[0].PATIENT_ID;
    console.log(patientId);
    
    let results;
    let ans;
    // Check if docSlotId exists in the token generator table
    const currentDate = new Date().toISOString().split('T')[0];
    console.log(currentDate);
const check = `SELECT * FROM appointment WHERE DOC_SLOT_ID = ${docSlotId} AND PATIENT_ID = ${patientId} AND DATE = '${currentDate}'`;


    
    console.log(check);
    try{
      [ans] = await db.query(check);
    }
    catch(e)
    {
      console.error(e);
    }
    console.log(ans.length);
    if (ans.length > 0) {
      return res.status(400).json({ message: 'Slot already booked' });
    }
    
    const checkQuery = `SELECT * FROM token_generator WHERE DOC_SLOT_ID = ${docSlotId}`;
    try {
      [results] = await db.query(checkQuery);
      console.log(results.length);
    } catch (error) {
      console.error('Error executing query:', error);
    }
    if (results.length > 0) {
      // If docSlotId exists, update the current_token_number
      const updateQuery = `
        UPDATE token_generator
        SET CURRENT_TOKEN_NUMBER = CURRENT_TOKEN_NUMBER + 1
        WHERE DOC_SLOT_ID = ${docSlotId}
      `;
      await db.query(updateQuery);
    } else {
      // If docSlotId doesn't exist, insert a new row
      const insertQuery = `
        INSERT INTO token_generator (DOC_SLOT_ID, DATE, CURRENT_TOKEN_NUMBER)
        VALUES (${docSlotId}, CURRENT_DATE(), 1)
      `;
      await db.query(insertQuery);
    }
    // Get the relevant details from token_generator
    const tokenDetailsQuery = `
      SELECT * FROM token_generator WHERE DOC_SLOT_ID = ${docSlotId}
    `;
    const [tokenDetails] = await db.query(tokenDetailsQuery);
    console.log(tokenDetails);
    if (tokenDetails.length === 0) {
      throw new Error('Token details not found');
    }

    // Insert into the appointment table
    const insertAppointmentQuery = `
      INSERT INTO appointment (PATIENT_ID, TOKEN_NUMBER, DOC_SLOT_ID, DATE, HOSPITAL_ID)
      VALUES (?, ?, ?, ?, ?)
    `;
    console.log(patientId);
    const values = [patientId, tokenDetails[0].CURRENT_TOKEN_NUMBER, docSlotId, tokenDetails[0].DATE, hospitalId];
    await db.query(insertAppointmentQuery, values);

    // Return success response
    res.status(200).json({ message: 'Slot booked successfully' });
  } catch (error) {
    console.error('Error booking slot:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/user-profile', async (req, res) => {
  try {
    const phoneNumber = req.user.phoneNumber; // Assuming the phone number is stored in req.user
    console.log(phoneNumber+"  ");
    
    // Fetch patient details from the patient table
    const patientQuery = 'SELECT * FROM patient WHERE CONTACT_NUMBER = ?';
    const [patientResults] = await db.query(patientQuery, [phoneNumber]);
    
    if (patientResults.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const patient = patientResults[0];
    
    // Fetch patient appointments from the appointment table
    const appointmentsQuery = `SELECT
    appointment.*,
    hospital.HOSPITAL_NAME,
    slot.DOCTOR_ID,
    doctor.DOCTOR_NAME
  FROM
    appointment
  JOIN
    hospital ON appointment.HOSPITAL_ID = hospital.HOSPITAL_ID
  JOIN
    slot ON appointment.DOC_SLOT_ID = slot.DOC_SLOT_ID
  JOIN
    doctor ON slot.DOCTOR_ID = doctor.DOCTOR_ID
  WHERE
    appointment.PATIENT_ID = ? AND
    appointment.APPOINTMENT_STATUS IN ('FINISHED', 'MISSED');  
    `;
    const [appointments] = await db.query(appointmentsQuery, [patient.PATIENT_ID]);
    
    // Return patient details and appointments
    res.status(200).json({ patient, appointments });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/current-status', async (req, res) => {
  try {
    const phoneNumber = req.user.phoneNumber; // Assuming the phone number is stored in req.user
    console.log(phoneNumber+"  ");
    
    // Fetch patient details from the patient table
    const patientQuery = 'SELECT * FROM patient WHERE CONTACT_NUMBER = ?';
    const [patientResults] = await db.query(patientQuery, [phoneNumber]);
    
    if (patientResults.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const patient = patientResults[0];
    
    // Fetch patient appointments from the appointment table
    const appointmentsQuery = `SELECT
    appointment.*,
    hospital.HOSPITAL_NAME,
    slot.DOCTOR_ID,
    doctor.DOCTOR_NAME
  FROM
    appointment
  JOIN
    hospital ON appointment.HOSPITAL_ID = hospital.HOSPITAL_ID
  JOIN
    slot ON appointment.DOC_SLOT_ID = slot.DOC_SLOT_ID
  JOIN
    doctor ON slot.DOCTOR_ID = doctor.DOCTOR_ID
  WHERE
    appointment.PATIENT_ID = ? AND
    appointment.APPOINTMENT_STATUS = 'YET_TO_START'; 
    `;
    const [appointments] = await db.query(appointmentsQuery, [patient.PATIENT_ID]);
    
    // Return patient details and appointments
    res.status(200).json({ patient, appointments });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/appointments/:appointmentId/details', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const phoneNumber = req.user.phoneNumber; // Assuming the phone number is stored in req.user

    // Fetch patient details from the patient table
    const patientQuery = 'SELECT * FROM patient WHERE CONTACT_NUMBER = ?';
    const [patientResults] = await db.query(patientQuery, [phoneNumber]);

    if (patientResults.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patient = patientResults[0];

    // Fetch current token for the clicked appointment ID
    const currentTokenQuery = `
    SELECT slot.CURRENT_TOKEN_NUMBER, slot.STATUS_OF_SLOT
    FROM appointment
    JOIN slot ON appointment.DOC_SLOT_ID = slot.DOC_SLOT_ID
    WHERE appointment.APPOINTMENT_ID = ? AND appointment.PATIENT_ID = ?;
    `;
    const [currentTokenResults] = await db.query(currentTokenQuery, [appointmentId, patient.PATIENT_ID]);

    if (currentTokenResults.length === 0) {
      return res.status(404).json({ error: 'Current token not found for the given appointment ID' });
    }

    const currentToken = currentTokenResults[0].CURRENT_TOKEN_NUMBER;
    const statusofSlot = currentTokenResults[0].STATUS_OF_SLOT;

    // Return the current token
    res.status(200).json({ currentToken, statusofSlot });
  } catch (error) {
    console.error('Error fetching appointment details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});