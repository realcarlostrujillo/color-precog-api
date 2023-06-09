const db = require("../db/db");
const User = require("../models/user");
const { checkPassword } = require("../auth/bcrypt");

const handleLogin = () => async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ message: "Incorrect form submission" });
	}

	try {
		const result = await db.transaction(async (t) => {
			const user = await User.findOne({ where: { email: email }, t });

			if (!user) {
				return res.status(400).json({ message: "User not found" });
			}

			const match = await checkPassword(password, user.password);

			if (!match) {
				return res.status(400).json({ message: "Incorrect email or password" });
			}

			res.cookie("user", JSON.stringify(user.id));
			res.status(200).json({ message: "Success" });
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "An error occurred while signing in." });
	}
};

module.exports = { handleLogin };
