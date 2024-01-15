import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { ReactSortable } from "react-sortablejs";

export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  category: assignedCategory,
  images: existingImages,
  properties: assignedProperties,
}) {
  const [title, setTitle] = useState(existingTitle || "");
  const [description, setDescription] = useState(existingDescription || "");
  const [productProperties, setProductProperties] = useState(
    assignedProperties || {}
  );
  const [price, setPrice] = useState(existingPrice || "");
  const [category, setCategory] = useState(assignedCategory || "");

  const [images, setImages] = useState(existingImages || []);
  const [selectedImages, setSelectedImages] = useState([]);
  const [goToProducts, setGoToProducts] = useState(false);
  const [categories, setCategories] = useState([]);

  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const removeSelectedImage = (index) => {
    const updatedSelectedImages = [...selectedImages];
    updatedSelectedImages.splice(index, 1);

    setSelectedImages(updatedSelectedImages);
    setProductProperties({
      ...productProperties,
      images: updatedSelectedImages,
    });
  };

  useEffect(() => {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }, []);

  async function saveProduct(event) {
    event.preventDefault();

    const data = {
      title,
      description,
      price,
      category,
      images: selectedImages.length > 0 ? selectedImages : existingImages || [],
      properties: productProperties,
    };

    console.log("Data to be saved:", data);

    const files = event.target.querySelector('input[type="file"]').files;

    try {
      let product;

      if (_id) {
        if (files.length > 0) {
          setIsUploading(true);
          const uploadedImages = await uploadImages(files);
          setIsUploading(false);

          product = await axios.put(`/api/product?id=${_id}`, {
            ...data,
            _id,
            images: [...(existingImages || []), ...uploadedImages],
          });
        } else {
          product = await axios.put(`/api/product?id=${_id}`, { ...data, _id });
        }
      } else {
        let product = await axios.post("/api/product", data);
        console.log("Product created:", product.data);
        if (files.length > 0) {
          setIsUploading(true);
          const uploadedImages = await uploadImages(files);
          setIsUploading(false);
        
          product = await axios.put(`/api/product?id=${product.data._id}`, {
            images: [...(existingImages || []), ...uploadedImages],
          });
        }
      }
      router.push("/product");
    } catch (error) {
      console.error("Error saving product:", error);
    }
  }

  async function uploadImages(files) {
    const uploadedImages = [];

    try {
      await Promise.all(
        Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", "nu0ldhyv");

          try {
            const uploadResponse = await fetch(
              "https://api.cloudinary.com/v1_1/dpr7tcchw/image/upload",
              {
                method: "POST",
                body: formData,
              }
            );

            if (!uploadResponse.ok) {
              throw new Error(`HTTP error! Status: ${uploadResponse.status}`);
            }

            const uploadedImageData = await uploadResponse.json();
            const imageUrl = uploadedImageData.secure_url;
            uploadedImages.push(imageUrl);
          } catch (error) {
            console.error("Error uploading image to Cloudinary:", error);
          }
        })
      );
    } catch (error) {
      console.error("Error uploading images:", error);
    }

    return uploadedImages;
  }

  async function handleFileInputChange(event) {
    const files = event.target.files;
    setIsUploading(true);

    try {
      const uploadedImages = await uploadImages(files);

      const newSelectedImages =
        selectedImages.length > 0
          ? [...selectedImages, ...uploadedImages]
          : uploadedImages;

      setSelectedImages(newSelectedImages);

      setProductProperties({
        ...productProperties,
        images: newSelectedImages,
      });
    } finally {
      setIsUploading(false);
    }
  }

  function updateImagesOrder(newImages) {
    setImages(newImages);
  }

  useEffect(() => {
    setImages(existingImages || []);
  }, [existingImages]);

  if (goToProducts) {
    router.push("/product");
  }

  function setProductProp(propName, value) {
    setProductProperties((prev) => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      return newProductProps;
    });
  }

  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({ _id }) => _id === category);
    propertiesToFill.push(...catInfo.properties);
    while (catInfo?.parent?._id) {
      const parentCat = categories.find(
        ({ _id }) => _id === catInfo?.parent?._id
      );
      propertiesToFill.push(...parentCat.properties);
      catInfo = parentCat;
    }
  }

  return (
    <form onSubmit={saveProduct}>
      <label>Product name</label>
      <input
        type="text"
        placeholder="product name"
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
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
        <ReactSortable
          list={images}
          className="flex flex-wrap gap-1"
          setList={updateImagesOrder}
        >
          {!!images?.length &&
            images.map((link, index) => (
              <div
                key={link}
                className="relative h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200"
              >
                <img src={link} alt="" className="rounded-lg" />
                <button
                  type="button"
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full cursor-pointer"
                  onClick={() => removeSelectedImage(index)}
                >
                  X
                </button>
              </div>
            ))}
        </ReactSortable>
        {selectedImages.length > 0 &&
          selectedImages.map((selectedImage, index) => (
            <div
              key={selectedImage}
              className="relative h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200"
            >
              <img src={selectedImage} alt="" className="rounded-lg" />
              <button
                type="button"
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full cursor-pointer"
                onClick={() => removeSelectedImage(index)}
              >
                X
              </button>
            </div>
          ))}
        {isUploading && (
          <div className="h-24 flex items-center">
            <Spinner />
          </div>
        )}
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
          <input
            type="file"
            onChange={handleFileInputChange}
            className="hidden"
            multiple
          />
        </label>
      </div>
      <label>Description</label>
      <textarea
        placeholder="description"
        value={description}
        onChange={(ev) => setDescription(ev.target.value)}
      />
      <label>Price (in USD)</label>
      <input
        type="number"
        placeholder="price"
        value={price}
        onChange={(ev) => setPrice(ev.target.value)}
      />
      <button type="submit" className="p-2 bg-gray-300 rounded-lg">
        Save
      </button>
    </form>
  );
}
