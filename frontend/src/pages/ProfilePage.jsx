import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

import ProfileHeader from "../components/ProfileHeader";
import Tabs, { TabList, Tab } from "../components/Tabs";
import AboutSection from "../components/AboutSection";
import ExperienceSection from "../components/ExperienceSection";
import EducationSection from "../components/EducationSection";
import SkillsSection from "../components/SkillsSection";
import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";

const TABS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
];

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

  const [activeTab, setActiveTab] = useState(TABS[0].id);

  // Refs for tabs and explicit section refs passed to child components
  const tabsRef = useRef({});
  const aboutRef = useRef(null);
  const experienceRef = useRef(null);
  const educationRef = useRef(null);
  const skillsRef = useRef(null);
  const sectionsRef = useRef({});

  useEffect(() => {
    // populate refs for sections from explicit refs
    sectionsRef.current = {
      about: aboutRef.current,
      experience: experienceRef.current,
      education: educationRef.current,
      skills: skillsRef.current,
    };

    const observerOptions = { root: null, rootMargin: "-20% 0px -40% 0px", threshold: 0 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    }, observerOptions);

    Object.values(sectionsRef.current).filter(Boolean).forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Keyboard nav is handled by the Tabs component

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
    <div className='max-w-6xl mx-auto'>
      <div className='space-y-4'>
        {/* Profile header card */}
        <ProfileHeader userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />

        {/* Tabs nav (anchor links) */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
          <div className='max-w-6xl mx-auto px-6'>
            <Tabs defaultIndex={0}>
              <TabList className='flex space-x-6 py-3 text-sm'>
                {TABS.map((t, i) => (
                  <Tab
                    key={t.id}
                    index={i}
                    ref={(el) => (tabsRef.current[t.id] = el)}
                    className={`${activeTab === t.id ? "border-blue-600 text-gray-900" : "border-transparent text-gray-700"} relative px-1`}
                    onClick={(e) => {
                      e.preventDefault();
                      sectionsRef.current[t.id]?.scrollIntoView({ behavior: "smooth", block: "start" });
                      setActiveTab(t.id);
                    }}
                  >
                    <span className='relative z-10'>{t.label}</span>
                    <span
                      aria-hidden
                      className={`absolute left-0 right-0 bottom-0 h-0.5 bg-blue-600 transition-transform duration-200 ${activeTab === t.id ? 'scale-x-100' : 'scale-x-0'}`}
                      style={{ transformOrigin: document.dir === 'rtl' ? 'right center' : 'left center' }}
                    />
                  </Tab>
                ))}
              </TabList>
            </Tabs>
          </div>
        </div>

        {/* Main content area: main column + right sidebar */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          <div className='lg:col-span-8 space-y-4'>
            <section id='about' ref={aboutRef} tabIndex={-1} role='region' aria-labelledby='about-tab'>
              <AboutSection sectionRef={aboutRef} userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
            </section>

            <section id='experience' ref={experienceRef} tabIndex={-1} role='region' aria-labelledby='experience-tab'>
              <ExperienceSection sectionRef={experienceRef} userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
            </section>

            <section id='education' ref={educationRef} tabIndex={-1} role='region' aria-labelledby='education-tab'>
              <EducationSection sectionRef={educationRef} userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
            </section>

            <section id='skills' ref={skillsRef} tabIndex={-1} role='region' aria-labelledby='skills-tab'>
              <SkillsSection sectionRef={skillsRef} userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
            </section>
          </div>

          <aside className='hidden lg:block lg:col-span-4'>
            <div className='sticky top-24 space-y-4'>
              <Sidebar user={userData} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
