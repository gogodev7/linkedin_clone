import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import Avatar from './Avatar';
import { getMediaUrl } from '../lib/media';

export default function EditProfileModal({ isOpen, onClose, userData, onSave }) {
  const [form, setForm] = useState({
    name: userData?.name || '',
    headline: userData?.headline || '',
    location: userData?.location || '',
    profilePicture: userData?.profilePicture || null,
    bannerImg: userData?.bannerImg || null,
  });



  const modalRef = useRef();
  const overlayRef = useRef();
  const firstInputRef = useRef();

  const validateImage = (file) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxBytes = 2 * 1024 * 1024; // 2MB
    if (!allowed.includes(file.type)) {
      toast.error('Only PNG/JPEG images are allowed');
      return false;
    }
    if (file.size > maxBytes) {
      toast.error('Image must be under 2MB');
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files && files[0];
    if (!file) return;
    if (!validateImage(file)) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, [name]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // when opened, initialize form with latest userData
  useEffect(() => {
    setForm({
      name: userData?.name || '',
      headline: userData?.headline || '',
      location: userData?.location || '',
      profilePicture: userData?.profilePicture || null,
      bannerImg: userData?.bannerImg || null,
    });
    // focus first input
    setTimeout(() => firstInputRef.current?.focus(), 50);
  }, [isOpen, userData]);

  // close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  const bannerSrc = form.bannerImg || getMediaUrl(userData?.bannerImg) || '/banner.png';
  const avatarSrc = form.profilePicture || getMediaUrl(userData?.profilePicture) || '/avatar.png';

  return (
    <div ref={overlayRef} onClick={handleOverlayClick} className="fixed inset-0 bg-black bg-opacity-45 flex items-start justify-center z-60 p-6">
      <div ref={modalRef} className="bg-white rounded-lg w-full max-w-3xl shadow-lg overflow-hidden relative" role="dialog" aria-modal="true">
        <div className="relative">
          <div className="w-full h-40 bg-gray-100" style={{ backgroundImage: `url('${bannerSrc}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

          <label className="absolute right-4 top-4 bg-white/80 px-3 py-1 rounded text-sm cursor-pointer hover:bg-white" title="Change banner">
            Change
            <input type="file" name="bannerImg" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>

          <div className="absolute left-6 -bottom-12">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white bg-white">
              <Avatar src={avatarSrc} name={userData?.name} size={112} />
            </div>
            <label className="block mt-2 text-center text-sm text-gray-600 cursor-pointer">
              Change photo
              <input type="file" name="profilePicture" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        <div className="p-6 pt-16">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold">Edit public profile</h2>
            <button onClick={onClose} aria-label="Close" className="text-gray-600">✕</button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600">Name</label>
              <input ref={firstInputRef} className="w-full border rounded p-2" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-gray-600">Headline</label>
              <input className="w-full border rounded p-2" value={form.headline} onChange={(e) => setForm({...form, headline: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">Location</label>
              <input className="w-full border rounded p-2" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
            <button onClick={() => { onSave(form); onClose(); }} className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
