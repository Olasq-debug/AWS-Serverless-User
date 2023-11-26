const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { builtinModules } = require('module');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'UserTable';

async function getUserByUsername(username) {
    const params = {
        TableName: tableName,
        Key: { username },
    };
  
    const result = await dynamoDB.get(params).promise();
    return result.Item;
  }
  
  async function saveUserToDB(username, password) {
    const params = {
        TableName: tableName,
        Item: { username, password },
    };
  
    await dynamoDB.put(params).promise();
  }
  
  async function hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
  
  async function verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  


module.exports = {
    getUserByUsername,
    saveUserToDB,
    hashPassword,
    verifyPassword,
 
}