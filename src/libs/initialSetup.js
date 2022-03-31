import User from "../models/User";
import Business from "../models/Business"

import bcrypt from "bcryptjs";

export const createAdmin = async () => {
  // check for an existing admin user
  let user = await User.findOne({ where: { emailAddress: "admin@demo.com" } });
  let business = undefined;
  if (!user) {
    // create a new admin user
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("demo", salt);
    user = await User.create({
      name: 'admin',
      username: "admin",
      emailAddress: "admin@demo.com",
      password: hash,
      type: 'admin',
      status: 'active',
    });
    console.log('Admin User Created!');
  } else {
    business = await Business.findOne({ where: { userId: user.id }});
  }

  if (!business) {
    console.log(user.id)
    await Business.create({
      name: "Nombre comercio",
      avatar: "",
      userId: user.id
    });
    console.log('Business User Created!');
  }
};