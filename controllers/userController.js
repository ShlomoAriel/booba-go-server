const User = require('../models/User');

// Function to find or create a user based on Firebase UID
const findOrCreateUser = async (firebaseUser) => {
  console.log('Checking for user with Firebase UID:', firebaseUser.uid);

  let user = await User.findOne({ uid: firebaseUser.uid });

  if (!user) {
    console.log('No user found. Creating a new user in MongoDB...');
    user = new User({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    });
    await user.save();
    console.log('New MongoDB user created:', user);
  } else {
    console.log('User found in MongoDB:', user);
  }

  return user;
};

module.exports = { findOrCreateUser };
