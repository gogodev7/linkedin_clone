import User from "../models/user.model.js";
import path from "path";

export const getSuggestedConnections = async (req, res) => {
	try {
		const currentUser = await User.findById(req.user._id).select("connections");

		// find users who are not already connected, and also do not recommend our own profile!! right?
		const suggestedUser = await User.find({
			_id: {
				$ne: req.user._id,
				$nin: currentUser.connections,
			},
		})
			.select("name username profilePicture headline")
			.limit(3);

		res.json(suggestedUser);
	} catch (error) {
		console.error("Error in getSuggestedConnections controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getPublicProfile = async (req, res) => {
	try {
		const user = await User.findOne({ username: req.params.username }).select("-password");

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json(user);
	} catch (error) {
		console.error("Error in getPublicProfile controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const updateProfile = async (req, res) => {
	try {
		const allowedFields = [
			"name",
			"username",
			"headline",
			"about",
			"location",
            // profilePicture and bannerImg are handled via multipart files
			"skills",
			"experience",
			"education",
		];

		const updatedData = {};

		for (const field of allowedFields) {
			if (req.body[field] !== undefined) {
				let value = req.body[field];
				// For multipart/form-data, arrays/objects may arrive JSON-encoded strings
				if (
					(field === "skills" || field === "experience" || field === "education") &&
					typeof value === "string"
				) {
					try {
						value = JSON.parse(value);
					} catch (e) {
						// leave as-is if not valid JSON
					}
				}
				updatedData[field] = value;
			}
		}

        const profileFile = req.files?.profilePicture?.[0];
        const bannerFile = req.files?.bannerImg?.[0];

        if (profileFile) {
            updatedData.profilePicture = profileFile.filename ? path.join('/uploads', profileFile.filename) : undefined;
        }

        if (bannerFile) {
            updatedData.bannerImg = bannerFile.filename ? path.join('/uploads', bannerFile.filename) : undefined;
        }

		const user = await User.findByIdAndUpdate(req.user._id, { $set: updatedData }, { new: true }).select(
			"-password"
		);

		res.json(user);
	} catch (error) {
		console.error("Error in updateProfile controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};
