import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { ProductAddStudio } from '../../components/product/ProductAddStudio';
import { Package } from 'lucide-react';

export const AdminAddProduct = () => {
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
          addToast('Failed to load product for editing', 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleSubmitProduct = async (payload) => {
    try {
      if (isEditing) {
        await api.put(`/admin/products/${id}`, payload);
        addToast(`Admin listing "${payload.title}" updated successfully!`, 'success');
      } else {
        await api.post('/admin/products', payload);
        addToast(`Official listing "${payload.title}" published to catalog!`, 'success');
      }
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      addToast(
        err.response?.data?.message || 'Error saving product listing',
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
          Loading Listing Studio Data...
        </p>
      </div>
    );
  }

  return (
    <ProductAddStudio
      mode="admin"
      initialData={product}
      isEditing={isEditing}
      onSubmitProduct={handleSubmitProduct}
      backUrl="/admin/products"
    />
  );
};

export default AdminAddProduct;
