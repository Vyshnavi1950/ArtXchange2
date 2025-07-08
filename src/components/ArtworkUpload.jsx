// frontend/src/components/ArtworkUpload.jsx
import { useState } from "react";
import api from "../utils/api";

export default function ArtworkUpload({ onAdd }) {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");

  const handleUpload = async () => {
    if (!image) return alert("Choose an image first");
    const fd = new FormData();
    fd.append("image", image);         // must match backend multer field name
    fd.append("caption", caption);

    try {
      const { data } = await api.post("/users/me/posts", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onAdd(data); // Add to profile page UI
      setImage(null);
      setCaption("");
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    }
  };

  return (
    <div className="upload-box">
      <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
      <input
        type="text"
        placeholder="Caption (optional)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}
