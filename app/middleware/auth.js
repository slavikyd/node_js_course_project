const { verify } = require("jsonwebtoken");

// In-memory user storage (same as in auth routes)
let inMemoryUsers = [];

const protected = async (req, res, next) => {
  // get the token from the header
  const authorization = req.headers["authorization"];
  
  // if we don't have a token, return error
  if (!authorization) {
    return res.status(401).json({
      message: "No token! 🤔",
      type: "error",
    });
  }
  
  // if we have a token, you have to verify it
  const token = authorization.split(" ")[1];
  let id;
  
  try {
    id = verify(token, process.env.ACCESS_TOKEN_SECRET).id;
  } catch {
    return res.status(401).json({
      message: "Invalid token! 🤔",
      type: "error",
    });
  }
  
  // if the token is invalid, return error
  if (!id) {
    return res.status(401).json({
      message: "Invalid token! 🤔",
      type: "error",
    });
  }
  
  // if the token is valid, check if the user exists in in-memory storage
  const user = inMemoryUsers.find(user => user._id === id);
  
  // if the user doesn't exist, return error
  if (!user) {
    return res.status(401).json({
      message: "User doesn't exist! 😢",
      type: "error",
    });
  }
  
  // if the user exists, we'll add a new field "user" to the request
  req.user = user;
  
  // call the next middleware
  next();
};

// Function to share the users array between files
const setUsers = (users) => {
  inMemoryUsers = users;
};

module.exports = { protected, setUsers };