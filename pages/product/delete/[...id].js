import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

export default function DeleteProductPage() {
  const router = useRouter();
  const [productInfo, setProductInfo] = useState();
  const { id } = router.query;

  useEffect(() => {
    if (!id) {
      return;
    }

    axios.get("/api/product?id=" + id).then((response) => {
      setProductInfo(response.data);
    });
  }, [id]);

  function goBack() {
    router.push("/product");
  }

  async function deleteProduct() {
    const MySwal = withReactContent(Swal);

    MySwal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${productInfo?.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await axios.delete("/api/product?id=" + id);
        MySwal.fire("Deleted!", "The product has been deleted.", "success").then(() => {
          goBack();
        });
      }
    });
  }

  return (
    <Layout>
      
      <div className="flex gap-2 justify-center">
        <button onClick={deleteProduct} className="btn-red">
          Delete Product
        </button>
        <button className="btn-default" onClick={goBack}>
          NO
        </button>
      </div>
    </Layout>
  );
}
