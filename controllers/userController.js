const User = require('../models/User');

// Function to find or create a user based on Firebase UID
const findOrCreateUser = async (firebaseUser) => {
  let user = await User.findOne({ uid: firebaseUser.uid });

  if (!user) {
    // If the user doesn't exist, create a new user
    user = new User({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    });
    await user.save();
  }

  return user;
};

module.exports = { findOrCreateUser };
