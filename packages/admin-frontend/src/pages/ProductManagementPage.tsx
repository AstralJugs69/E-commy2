import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { Container, Table, Button, Alert, Spinner, Modal, Form, InputGroup, Card } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { BsImage } from 'react-icons/bs';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  stock?: number;
  imageUrl?: string;
  categoryId?: number;
  category?: {
    id: number;
    name: string;
  };
}

const API_BASE_URL = 'http://localhost:3001/api';

const ProductManagementPage: React.FC = () => {
  // Products list state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Categories list state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Add state for inline stock adjustment
  const [adjustingProductId, setAdjustingProductId] = useState<number | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState<string>('');

  // Fetch products and categories on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsCategoriesLoading(true);
    setCategoriesError(null);
    
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setCategoriesError('Authentication required. Please log in again.');
      setIsCategoriesLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/categories`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCategories(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setCategoriesError(err.response.data.message || 'Failed to fetch categories.');
        console.error('Error fetching categories:', err.response.data);
      } else {
        setCategoriesError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem('admin_token');
    if (!token) {
      setError('Authentication required. Please log in again.');
      setIsLoading(false);
      return;
    }

    try {
      // Use admin endpoint to get products with category information
      const response = await axios.get(`${API_BASE_URL}/admin/products`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProducts(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(err.response.data.message || 'Failed to fetch products.');
        }
        console.error('Error fetching products:', err.response.data);
      } else {
        setError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!window.confirm(`Are you sure you want to delete product #${productId}?`)) {
      return;
    }

    const token = localStorage.getItem('admin_token');
    if (!token) {
      setError('Authentication required. Please log in again.');
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/admin/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh product list
      fetchProducts();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else if (err.response.status === 409) {
          setError('Cannot delete product because it is referenced in orders.');
        } else {
          setError(err.response.data.message || `Failed to delete product #${productId}.`);
        }
        console.error('Error deleting product:', err.response.data);
      } else {
        setError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    }
  };

  const handleShowAddModal = () => {
    // Reset form state
    setEditingProduct(null);
    setFormName('');
    setFormPrice('');
    setFormDescription('');
    setFormStock('');
    setFormImageUrl('');
    setFormCategoryId('');
    setModalError(null);
    setSelectedFile(null);
    setUploadError(null);
    setShowModal(true);
  };

  const handleShowEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.price.toString());
    setFormDescription(product.description || '');
    setFormStock(product.stock?.toString() || '');
    setFormImageUrl(product.imageUrl || '');
    setFormCategoryId(product.categoryId?.toString() || '');
    setModalError(null);
    setSelectedFile(null);
    setUploadError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalError(null);
    setUploadError(null);
  };

  const handleSaveProduct = async (event: FormEvent) => {
    event.preventDefault();
    
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setModalError('Authentication required. Please log in again.');
      return;
    }

    // Validate form data
    if (!formName.trim()) {
      setModalError('Product name is required.');
      return;
    }

    const priceValue = parseFloat(formPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      setModalError('Price must be a positive number.');
      return;
    }

    setIsModalLoading(true);
    setModalError(null);
    setUploadError(null);

    // Handle image upload if a file is selected
    if (selectedFile) {
      setIsUploading(true);
      
      try {
        // Create form data for file upload
        const formData = new FormData();
        formData.append('productImage', selectedFile);
        
        // Upload the image
        const uploadResponse = await axios.post(
          `${API_BASE_URL}/admin/upload`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        // Get the imageUrl from the response and update formImageUrl
        const uploadedImageUrl = uploadResponse.data.imageUrl;
        setFormImageUrl(uploadedImageUrl);
        
        // Clear the selected file state
        setSelectedFile(null);
      } catch (err) {
        // Handle upload errors
        setIsUploading(false);
        setIsModalLoading(false);
        
        let errorMessage = 'Image upload failed';
        if (axios.isAxiosError(err) && err.response) {
          errorMessage = err.response.data.message || errorMessage;
        }
        
        setUploadError(errorMessage);
        toast.error('Image upload failed');
        return; // Don't proceed with saving the product
      } finally {
        setIsUploading(false);
      }
    }

    // Prepare form data for product
    const productData = {
      name: formName.trim(),
      price: priceValue,
      description: formDescription.trim() || undefined,
      stock: formStock ? parseInt(formStock, 10) : undefined,
      imageUrl: formImageUrl.trim() || undefined,
      categoryId: formCategoryId ? parseInt(formCategoryId, 10) : null
    };

    try {
      if (editingProduct) {
        // Update existing product
        await axios.put(
          `${API_BASE_URL}/admin/products/${editingProduct.id}`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // Create new product
        await axios.post(
          `${API_BASE_URL}/admin/products`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // Close modal and refresh product list
      handleCloseModal();
      fetchProducts();
      toast.success(`Product ${editingProduct ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setModalError('Your session has expired. Please log in again.');
        } else {
          setModalError(err.response.data.message || 'Failed to save product.');
        }
        console.error('Error saving product:', err.response.data);
      } else {
        setModalError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsModalLoading(false);
    }
  };

  // Function to handle stock adjustment submission
  const handleAdjustStock = async (productId: number, adjustmentStr: string) => {
    const adjustmentInt = parseInt(adjustmentStr, 10);

    if (isNaN(adjustmentInt)) {
        toast.error("Adjustment value must be a valid integer.");
        return;
    }

    if (adjustmentInt === 0) {
        toast.info("No adjustment needed (value is 0).");
        setAdjustingProductId(null); // Close the input if adjustment is 0
        setAdjustmentValue('');
        return;
    }

    const token = localStorage.getItem('admin_token');
    if (!token) {
      toast.error('Authentication required. Please log in again.');
      return;
    }

    // Optimistic UI update can be added here later if desired

    try {
      console.log(`Adjusting stock for product ${productId} by ${adjustmentInt}`);
      const response = await axios.post(
        `${API_BASE_URL}/admin/products/${productId}/adjust-stock`,
        { adjustment: adjustmentInt },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success(`Stock for '${response.data.name}' updated to ${response.data.stock}.`);
      
      // Refresh product list to show updated stock
      await fetchProducts(); 
      
      // Reset adjustment state
      setAdjustingProductId(null);
      setAdjustmentValue('');

    } catch (err) {
      console.error('Error adjusting stock:', err);
      let errorMessage = 'Failed to adjust stock.';
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          errorMessage = 'Your session has expired or you are unauthorized.';
        } else {
          errorMessage = err.response.data.message || errorMessage;
        }
      }
      toast.error(errorMessage);
      // Optionally reset state even on error, or keep input open for correction
      // setAdjustingProductId(null);
      // setAdjustmentValue(''); 
    }
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Product Management</h2>
        <Button variant="primary" onClick={handleShowAddModal}>
          Add New Product
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading products...</p>
        </div>
      ) : (
        <div className="table-responsive">
          {products.length === 0 ? (
            <Alert variant="info">No products found. Add your first product!</Alert>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>{product.category?.name || 'N/A'}</td>
                    <td>
                      {adjustingProductId === product.id ? (
                        <InputGroup size="sm">
                          <Form.Control 
                            type="number" 
                            value={adjustmentValue} 
                            onChange={(e) => setAdjustmentValue(e.target.value)}
                            placeholder="Change by..." 
                            aria-label="Stock adjustment" 
                          />
                          <Button 
                            variant="outline-success" 
                            onClick={() => handleAdjustStock(product.id, adjustmentValue)}
                          >
                            Save
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            onClick={() => { setAdjustingProductId(null); setAdjustmentValue(''); }}
                          >
                            Cancel
                          </Button>
                        </InputGroup>
                      ) : (
                        <div className="d-flex align-items-center">
                          <span className="me-2">{product.stock !== undefined ? product.stock : 'N/A'}</span>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => { setAdjustingProductId(product.id); setAdjustmentValue(''); }}
                          >
                            Adjust
                          </Button>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ width: '80px', height: '60px' }}>
                        {product.imageUrl ? (
                          <Card.Img 
                            src={product.imageUrl.startsWith('http') 
                              ? product.imageUrl 
                              : `${API_BASE_URL}${product.imageUrl}`}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            className="border rounded"
                          />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center bg-light border rounded" style={{ width: '100%', height: '100%' }}>
                            <BsImage size={24} className="text-secondary" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          onClick={() => handleShowEditModal(product)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      )}

      {/* Product Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveProduct}>
          <Modal.Body>
            {modalError && (
              <Alert variant="danger" className="mb-3">
                {modalError}
              </Alert>
            )}
            {uploadError && (
              <Alert variant="danger" className="mb-3">
                Upload error: {uploadError}
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Product Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  required
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Product Description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Stock (Optional)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Stock Quantity"
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="productImageFile">
              <Form.Label>Product Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setSelectedFile(e.target.files ? e.target.files[0] : null)
                }
              />
              <Form.Text className="text-muted">
                Max file size: 5MB. Supported formats: PNG, JPEG, WebP, GIF.
              </Form.Text>
            </Form.Group>
            {formImageUrl && (
              <div className="mb-3">
                <p className="mb-1">Current Image:</p>
                <img 
                  src={formImageUrl.startsWith('http') ? formImageUrl : `${API_BASE_URL}${formImageUrl}`} 
                  alt="Product" 
                  style={{ maxHeight: '100px', maxWidth: '100%' }}
                  className="border rounded" 
                />
              </div>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Image URL (Optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="https://example.com/image.jpg"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
              />
              <Form.Text className="text-muted">
                You can either upload an image or provide a URL.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category (Optional)</Form.Label>
              <Form.Select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
              >
                <option value="">None</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={isModalLoading || isUploading}
            >
              {isModalLoading || isUploading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {isUploading ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                'Save Product'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ProductManagementPage; 