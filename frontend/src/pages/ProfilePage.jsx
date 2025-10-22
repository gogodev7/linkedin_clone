import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

import ProfileHeader from "../components/ProfileHeader";
import AboutSection from "../components/AboutSection";
import ExperienceSection from "../components/ExperienceSection";
import EducationSection from "../components/EducationSection";
import SkillsSection from "../components/SkillsSection";
import toast from "react-hot-toast";

const ProfilePage = () => {
	const { username } = useParams();
	const queryClient = useQueryClient();

	const { data: authUser, isLoading } = useQuery({
		queryKey: ["authUser"],
	});

	const { data: userProfile, isLoading: isUserProfileLoading } = useQuery({
		queryKey: ["userProfile", username],
		queryFn: () => axiosInstance.get(`/users/${username}`),
	});

    const { mutate: updateProfile } = useMutation({
        mutationFn: async (updatedData) => {
            const formData = new FormData();

            const appendField = async (key, value) => {
                if (value === undefined || value === null) return;

                // Convert data URLs for image fields into Blobs
                if ((key === "profilePicture" || key === "bannerImg") && typeof value === "string") {
                    if (value.startsWith("data:")) {
                        const resp = await fetch(value);
                        const blob = await resp.blob();
                        const filename = key + (blob.type && blob.type.includes("/") ? 
                            "." + blob.type.split("/")[1].split(";")[0] : ".png");
                        formData.append(key, blob, filename);
                    }
                    // If value is an existing URL/path, skip sending - backend updates only when a file is provided
                    return;
                }

                // Serialize complex fields
                if (Array.isArray(value) || typeof value === "object") {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, value);
                }
            };

            // Append all provided fields
            for (const [key, value] of Object.entries(updatedData || {})) {
                await appendField(key, value);
            }

            await axiosInstance.put("/users/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        },
		onSuccess: () => {
			toast.success("Profile updated successfully");
			queryClient.invalidateQueries(["userProfile", username]);
		},
	});

	if (isLoading || isUserProfileLoading) return null;

	const isOwnProfile = authUser.username === userProfile.data.username;
	const userData = isOwnProfile ? authUser : userProfile.data;

	const handleSave = (updatedData) => {
		updateProfile(updatedData);
	};

	return (
		<div className='max-w-4xl mx-auto'>
			<div className='space-y-4'>
				<ProfileHeader userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
				<AboutSection userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
				<ExperienceSection userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
				<EducationSection userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
				<SkillsSection userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
			</div>
		</div>
	);
};
export default ProfilePage;
