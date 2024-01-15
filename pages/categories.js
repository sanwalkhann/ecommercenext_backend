import Layout from "@/components/Layout";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { withSwal } from "react-sweetalert2";

function Categories({ swal }) {
  const [name, setName] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [editedCategory, setEditedCategory] = useState(null);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  function fetchCategories() {
    axios.get("/api/categories").then((response) => {
      setCategories(response.data);
    });
  }

  async function saveCategory(e) {
    e.preventDefault();
    const data = {
      name,
      parentCategory,
      properties: properties.map((p) => ({
        name: p.name,
        values: p.values.split(","),
      })),
    };
    if (editedCategory) {
      data._id = editedCategory._id;
      await axios.put("/api/categories", data);
      setEditedCategory(null);
    } else {
      await axios.post("/api/categories", data);
    }
    setName("");
    setParentCategory("");
    setProperties([]);
    fetchCategories();
  }

  function editCategory(category) {
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parent?._id);
    setProperties(
      category.properties.map(({ name, values }) => ({
        name,
        values: values.join(","),
      }))
    );
  }
  function deleteCategory(category) {
    swal
      .fire({
        title: "Are you sure?",
        text: `Do you want to delete ${category.name}?`,
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Yes, Delete!",
        confirmButtonColor: "#d55",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const { _id } = category;
          await axios.delete("/api/categories?_id=" + _id);
          fetchCategories();
        }
      })
      .catch((error) => {
        
      });
  }

  function addProperty() {
    setProperties((prev) => {
      return [...prev, { name: "", values: "" }];
    });
  }

  function handlePropertyNameChange(index, property, newName) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  }
  function handlePropertyValuesChange(index, property, newValues) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].values = newValues;
      return properties;
    });
  }

  function removeProperty(indexToRemove) {
    setProperties((prev) => {
      return [...prev].filter((p, pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
  }
  return (
    <Layout>
      <div>
        <div className="mt-6">
          <label>
            {editedCategory
              ? `Edit category ${editedCategory.name}`
              : "Create new category"}
          </label>
          <form onSubmit={saveCategory}>
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="text"
                placeholder={"Category name"}
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="rounded-xl px-2 mb-2 md:mb-0"
              />
              <select
                onChange={(e) => setParentCategory(e.target.value)}
                value={parentCategory}
                className="rounded-xl px-2"
              >
                <option value="">parent category</option>
                {categories.length > 0 &&
                  categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <div className="flex justify-between py-2 items-center">
                <label className="">Properties</label>
                <button
                  onClick={addProperty}
                  type="button"
                  className="text-sm bg-slate-800 text-white p-2 rounded-lg items-center"
                >
                  Add new property
                </button>
              </div>

              {properties.length > 0 &&
                properties.map((property, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-1">
                    <input
                      type="text"
                      value={property.name}
                      className="rounded-xl px-2 mb-2 md:mb-0"
                      onChange={(e) =>
                        handlePropertyNameChange(index, property, e.target.value)
                      }
                      placeholder="Property name (e.g., color)"
                    />
                    <input
                      type="text"
                      className="rounded-xl px-2 mb-2 md:mb-0"
                      onChange={(e) =>
                        handlePropertyValuesChange(index, property, e.target.value)
                      }
                      value={property.values}
                      placeholder="Values, comma separated"
                    />
                    <button
                      onClick={() => removeProperty(index)}
                      type="button"
                      className="btn-red"
                    >
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
                          d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              
            </div>
            <div className=" flex gap-1">
              {editedCategory && (
                <button
                  type="button"
                  onClick={() => {
                    setEditedCategory(null);
                    setName("");
                    setParentCategory("");
                    setProperties([]);
                  }}
                  className="bg-slate-400 text-white px-4 rounded-xl p-1 mt-2"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="bg-slate-800 text-white px-4 rounded-xl p-1  mt-2"
              >
                Save
              </button>
            </div>
          </form>
        </div>
        {!editedCategory && (
          <div className="font-semibold">
            <table className="mt-4 w-full text-sm md:text-xl lg:text-2xl xl:text-3xl  ">
              <thead className="">
                <tr className=" bg-slate-200 ">
                  <td>Category name</td>
                  <td className="md:pl-6 lg:pl-20 xl:pl-32">Parent category</td>
                  <td className="flex justify-end  md:mr-16">Action</td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 &&
                  categories.map((category) => (
                    <tr key={category._id} className=" ">
                      <td>{category.name}</td>
                      <td className="md:pl-12 lg:pl-28 xl:pl-40">
                        {category?.parent?.name}
                      </td>
                      <td className="flex gap-1 justify-end m-1">
                        <button
                          onClick={() => editCategory(category)}
                          className="flex items-center gap-1 bg-slate-800 rounded-md justify-center p-1 text-white"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                            />
                          </svg>
                          <span className="hidden md:block"> Edit</span>
                        </button>
                        <button
                          onClick={() => deleteCategory(category)}
                          className="flex items-center  gap-1 bg-red-600 rounded-md justify-center p-1 text-white"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                          <span className="hidden md:block"> Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default withSwal(({ swal }, ref) => <Categories swal={swal} />);
