import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  category: assignedCategory,
  properties: assignedProperties,
  images: existingImages,
}) {
  const [title, setTitle] = useState(existingTitle || "");
  const [description, setDescription] = useState(existingDescription || "");
  const [price, setPrice] = useState(existingPrice || "");
  const [category, setCategory] = useState(assignedCategory || "");
  const [goToProduct, setGoToProduct] = useState(false);
  const [categories, setCategories] = useState([]);
  const [productProperties, setProductProperties] = useState(assignedProperties || {});
  const [images, setImages] = useState(existingImages || []);
  const [newImages, setNewImages] = useState([]);
  const router = useRouter();
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }, []);

  async function saveProduct(e) {
    e.preventDefault();

    // Cloudinary configuration
    const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dpr7tcchw/image/upload";
    const cloudinaryPreset = "nu0ldhyv";

    // Upload new images to Cloudinary
    const uploadedImages = await Promise.all(
      newImages.map(async (image) => {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", cloudinaryPreset);

        const response = await fetch(cloudinaryUrl, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        
        return data.secure_url;
      })
    );

    // Combine existing and new images
    const updatedImages = [...images, ...uploadedImages];

    // Build product data including image URLs
    const data = {
      title,
      description,
      price,
      category,
      properties: productProperties,
      images: updatedImages,
    };

    // Save product data to the backend
    if (_id) {
      await axios.put("/api/product", { ...data, _id });
    } else {
      await axios.post("/api/product", data);
    }

    setGoToProduct(true);
  }

  const handleImageChange = (e) => {
    const selectedImages = Array.from(e.target.files);
    setNewImages([...newImages, ...selectedImages]);
  };

  if (goToProduct) {
    router.push("/product");
  }

  const handleCancel = () => {
    router.back();
  };

  const setProductProp = (propName, value) => {
    setProductProperties((prev) => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      return newProductProps;
    });
  };

  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({ _id }) => _id === category);
    propertiesToFill.push(...catInfo.properties);
    while (catInfo?.parent?._id) {
      const parentCat = categories.find(({ _id }) => _id === catInfo?.parent?._id);
      propertiesToFill.push(...parentCat.properties);
      catInfo = parentCat;
    }
  }

  useEffect(() => {
    const previews = newImages.map((image) => URL.createObjectURL(image));
    setImagePreviews(previews);
  }, [newImages]);

  return (
    <form onSubmit={saveProduct}>
      <label>Product Name</label>
      <input
        type="text"
        placeholder="enter product name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <label>Category</label>
      <select
        value={category}
        onChange={(ev) => setCategory(ev.target.value)}
        required
      >
        <option value=""> Select Category</option>
        {categories.length > 0 &&
          categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
      </select>
      {propertiesToFill.length > 0 &&
        propertiesToFill.map((p) => (
          <div key={p.name} className="">
            <label>{p.name[0].toUpperCase() + p.name.substring(1)}</label>
            <div>
              <select
                value={productProperties[p.name]}
                onChange={(ev) => setProductProp(p.name, ev.target.value)}
              >
                {p.values.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      <label>Photos</label>
      <div className="mb-2 flex flex-wrap gap-1">
        {images.map((image, index) => (
          <div key={index} className="w-24 h-24 relative">
            <img
              src={image}
              alt={`Product Image ${index + 1}`}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
        {imagePreviews.map((preview, index) => (
          <div key={`preview-${index}`} className="w-24 h-24 relative">
            <img
              src={preview}
              alt={`Image Preview ${index + 1}`}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
        <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <div>Add image</div>
          <input type="file" className="hidden" onChange={handleImageChange} multiple />
        </label>
      </div>
      <label>Description</label>
      <textarea
        placeholder="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>

      <label>Price</label>
      <input
        type="number"
        placeholder="0$"
        value={price}
        onChange={(e) => setPrice(Math.max(1, e.target.value))}
        required
      />

      <div className="flex gap-1 ">
        <button
          type="submit"
          className="bg-slate-800 text-white p-2 rounded-lg"
        >
          Save
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="bg-slate-800 text-white p-2 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
