/**
 * ImgBB Image Upload Service
 * Direct client-side upload to ImgBB API without custom backend
 */

const DEFAULT_IMGBB_API_KEY = "f6260052c21d64f0de252a586fe1203b";

export const isImgBBConfigured = () => {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY || DEFAULT_IMGBB_API_KEY;
  return Boolean(apiKey && apiKey !== "YOUR_IMGBB_API_KEY");
};

export const uploadToImgBB = async (imageFile, customApiKey = null) => {
  const apiKey = customApiKey || import.meta.env.VITE_IMGBB_API_KEY || DEFAULT_IMGBB_API_KEY;

  if (!apiKey || apiKey === "YOUR_IMGBB_API_KEY") {
    throw new Error(
      "ImgBB API Key পাওয়া যায়নি! দয়া করে .env ফাইলে VITE_IMGBB_API_KEY সেট করুন।"
    );
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      return {
        url: data.data.url,
        displayUrl: data.data.display_url,
        deleteUrl: data.data.delete_url,
        thumb: data.data.thumb?.url,
        medium: data.data.medium?.url,
      };
    } else {
      throw new Error(
        data.error?.message || "ImgBB-তে ছবি আপলোড করতে ব্যর্থ হয়েছে!"
      );
    }
  } catch (error) {
    console.error("ImgBB upload error:", error);
    throw error;
  }
};
