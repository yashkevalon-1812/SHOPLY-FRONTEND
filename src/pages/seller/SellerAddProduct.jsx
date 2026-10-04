import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { ProductAddStudio } from '../../components/product/ProductAddStudio';
import { Package } from 'lucide-react';

export const SellerAddProduct = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (id) {
      setLoading(true);
      api
        .get(`/products/${id}`)
        .then(({ data }) => {
          setProduct(data);
        })
        .catch((err) => {
          console.error(err);
          addToast('Failed to load merchant listing for editing', 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleSubmitProduct = async (payload) => {
    try {
      if (isEditing) {
        await api.put(`/seller/products/${id}`, payload);
        if (product?.approvalStatus === 'rejected') {
          addToast(`Listing "${payload.title}" updated and resubmitted for admin review!`, 'success');
        } else {
          addToast(`Listing "${payload.title}" updated successfully!`, 'success');
        }
      } else {
        await api.post('/seller/products', payload);
        addToast(
          `Product "${payload.title}" submitted successfully! It is now pending admin approval before appearing on the public store.`,
          'success'
        );
      }
      navigate('/seller/products');
    } catch (err) {
      console.error(err);
      addToast(
        err.response?.data?.message || 'Error publishing marketplace listing',
        'error'
      );
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 animate-pulse">
          <Package className="w-6 h-6 animate-bounce" />
        </div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Loading Seller Listing Studio Data...
        </p>
      </div>
    );
  }

  return (
    <ProductAddStudio
      mode="seller"
      initialData={product}
      isEditing={isEditing}
      onSubmitProduct={handleSubmitProduct}
      backUrl="/seller/products"
    />
  );
};

export default SellerAddProduct;
