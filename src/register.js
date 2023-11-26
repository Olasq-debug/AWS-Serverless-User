
const {
  getUserByUsername, 
  saveUserToDB, 
  hashPassword, 
  verifyPassword, 
  } = require('../middleware/helper.js');

  function createResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    };
  }

const registerAndLogin = async (event) => {
    try {
        const body = JSON.parse(event.body);
        console.log(`Events is ${event}`);

        if (event.httpMethod === 'POST' && event.resource === '/register') {
            // User Registration
            const { username, password } = body;

            // Check if the username is already taken
            const existingUser = await getUserByUsername(username);
            if (existingUser) {
                console.log(`Registration failed - Username '${username}' already taken`);
                return createResponse(400, { error: 'Username already taken' });
            }

            // Hash the password before storing it
            const hashedPassword = await hashPassword(password);

            // Save user details to DynamoDB
            await saveUserToDB(username, hashedPassword);

            console.log(`Registration successful - Username: '${username}'`);
            return createResponse(200, { message: 'Registration successful' });

        } else if (event.httpMethod === 'POST' && event.resource === '/login') {
            // User Login
            const { username, password } = body;

            // Retrieve user details from DynamoDB
            const user = await getUserByUsername(username);

            // Check if the user exists and verify the password
            if (user && await verifyPassword(password, user.password)) {
                console.log(`Login successful - Username: '${username}'`);
                return createResponse(200, { message: 'Login successful' });
            } else {
                console.log(`Login failed - Invalid username or password for '${username}'`);
                return createResponse(401, { error: 'Invalid username or password' });
            }
        } else {
            console.log(`Invalid request - Method: ${event.httpMethod}, Resource: ${event.resource}`);
            return createResponse(400, { error: 'Invalid request' });
        }
    } catch (error) {
        console.error('Error:', error);
        console.log('Internal server error - See CloudWatch logs for details');
        return createResponse(500, { error: 'Internal server error' });
    }
};

module.exports = {
  handler: registerAndLogin
}



