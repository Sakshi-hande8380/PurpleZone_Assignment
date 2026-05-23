const bcrypt = require('bcryptjs');

const initialStatements = [
  {
    id: "s1",
    text: "she dont have any idea how to fix it.",
    corrections: [
      "She doesn't have any idea how to fix it.",
      "She does not have any idea how to fix it."
    ],
    explanation: "Capitalize the first word 'She', use correct agreement 'doesn't' or 'does not' instead of 'dont', and end with a period."
  },
  {
    id: "s2",
    text: "the dogs chased it's tail around in circles.",
    corrections: [
      "The dogs chased their tail around in circles.",
      "The dogs chased their tails around in circles."
    ],
    explanation: "Capitalize the first word 'The', use correct possessive pronoun 'their' instead of 'it's', and end with a period."
  },
  {
    id: "s3",
    text: "we should of gone to the store earlier.",
    corrections: [
      "We should have gone to the store earlier."
    ],
    explanation: "Capitalize the first word 'We', use helper verb 'have' instead of preposition 'of' ('should have'), and end with a period."
  }
];

const users = [];
const submissions = [];
const statements = [...initialStatements];

const seedMockUser = async () => {
  if (users.length === 0) {
    const hashedPassword = await bcrypt.hash("Password@123", 10);
    users.push({
      id: "u1",
      username: "testuser",
      password: hashedPassword,
      createdAt: new Date()
    });
  }
};

seedMockUser();

module.exports = {
  users,
  statements,
  submissions,
  initialStatements
};

