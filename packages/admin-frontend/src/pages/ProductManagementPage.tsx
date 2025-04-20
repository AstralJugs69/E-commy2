import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import { Container, Table, Button, Alert, Spinner, Modal, Form, InputGroup, Image, Badge, Row, Col, Card, Tabs, Tab } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { FaImage } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa';
import { FaBox } from 'react-icons/fa';
import { FaEdit } from 'react-icons/fa';
import { FaTrash } from 'react-icons/fa';
import { FaSearch } from 'react-icons/fa';
import { FaTimes } from 'react-icons/fa';
import { FaTag } from 'react-icons/fa';
import { BsImage } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import api from '../utils/api';
import { getImageUrl } from '../utils/imageUrl';

interface Category {
  id: number;
  name: string;
}

interface ProductImage {
  id: number;
  url: string;
  productId: number;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  costPrice?: number | null;
  description?: string;
  stock?: number;
  categoryId?: number;
  category?: {
    id: number;
    name: string;
  };
  images?: ProductImage[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
  const [formCostPrice, setFormCostPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');

  // Multiple image management
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formImageUrls, setFormImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Backward compatibility (temporary, can be removed later)
  const [formImageUrl, setFormImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Add state for inline stock adjustment
  const [adjustingProductId, setAdjustingProductId] = useState<number | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState<string>('');

  // Add state for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Add state for stock adjustment modal
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState('');

  // Fetch products and categories on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsCategoriesLoading(true);
    setCategoriesError(null);
    
    try {
      const response = await api.get('/admin/categories');
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

    try {
      // Use admin endpoint to get products with category information
      const response = await api.get('/admin/products');
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
    if (!window.confirm(`Are you sure you want to delete product #${productId}? This action cannot be undone.`)) {
      return; // Stop execution if user cancels
    }

    try {
      await api.delete(`/api/admin/products/${productId}`);
      
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
    setFormCostPrice('');
    setFormDescription('');
    setFormStock('');
    setFormImageUrl('');
    setFormCategoryId('');
    setModalError(null);
    setSelectedFile(null);
    setSelectedFiles([]);
    setFormImageUrls([]);
    setUploadError(null);
    setShowModal(true);
  };

  const handleShowEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.price.toString());
    setFormCostPrice(product.costPrice?.toString() || '');
    setFormDescription(product.description || '');
    setFormStock(product.stock?.toString() || '');
    setFormCategoryId(product.categoryId?.toString() || '');
    setModalError(null);
    setSelectedFile(null);
    setSelectedFiles([]);
    
    // Set image URLs from product images
    if (product.images && product.images.length > 0) {
      setFormImageUrls(product.images.map(img => img.url));
      // For backward compatibility
      setFormImageUrl(product.images[0].url);
    } else {
      setFormImageUrls([]);
      setFormImageUrl('');
    }
    
    setUploadError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalError(null);
    setUploadError(null);
    setSelectedFiles([]);
    setFormImageUrls([]);
  };

  // Handle file selection for multiple images
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      
      // Check if adding these files would exceed the 5 image limit
      const totalImagesCount = formImageUrls.length + fileList.length;
      if (totalImagesCount > 5) {
        setUploadError(`You can only upload up to 5 images. You already have ${formImageUrls.length} image(s).`);
        return;
      }
      
      setSelectedFiles(fileList);
      setUploadError(null);
      
      // For backward compatibility
      setSelectedFile(fileList.length > 0 ? fileList[0] : null);
    }
  };
  
  // Remove a file from selectedFiles
  const handleRemoveSelectedFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    
    // Update single file state for backward compatibility
    setSelectedFile(newFiles.length > 0 ? newFiles[0] : null);
  };
  
  // Remove an existing image URL
  const handleRemoveImageUrl = (index: number) => {
    const newUrls = [...formImageUrls];
    newUrls.splice(index, 1);
    setFormImageUrls(newUrls);
    
    // Update single image URL for backward compatibility
    setFormImageUrl(newUrls.length > 0 ? newUrls[0] : '');
  };

  // Utility function for image upload that returns uploaded URLs
  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) {
      return [];
    }
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('productImages', file);
    });
    
    // Since our api utility doesn't support FormData content type headers,
    // we'll use axios directly for the file upload, but still leverage the API_URL
    const uploadResponse = await axios.post(
      `${API_URL}/api/admin/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        }
      }
    );
    
    return uploadResponse.data.imageUrls || [];
  };

  const handleSaveProduct = async (event: FormEvent) => {
    event.preventDefault();
    setIsModalLoading(true);
    setModalError(null);
    setUploadError(null);
    
    // Basic validation
    if (!formName.trim() || !formPrice.trim() || !formStock.trim()) {
      setModalError('Name, price, and stock are required fields.');
      setIsModalLoading(false);
      return;
    }
    
    try {
      // Parse values
      const parsedPrice = parseFloat(formPrice);
      const parsedStock = parseInt(formStock);
      const parsedCostPrice = formCostPrice.trim() ? parseFloat(formCostPrice) : null;
      
      let uploadedImageUrls: string[] = [...formImageUrls]; // Start with existing URLs that weren't removed
      
      // Handle file uploads if there are new files
      if (selectedFiles.length > 0) {
        setIsUploading(true);
        try {
          const newUrls = await uploadImages(selectedFiles);
          uploadedImageUrls = [...uploadedImageUrls, ...newUrls];
        } catch (err) {
          if (axios.isAxiosError(err) && err.response) {
            setUploadError(err.response.data.message || 'Failed to upload images.');
            console.error('Error uploading images:', err.response.data);
          } else {
            setUploadError('Network error during image upload.');
            console.error('Network error during upload:', err);
          }
          setIsModalLoading(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }
      
      // Prepare product data
      const productData = {
        name: formName,
        price: parsedPrice,
        costPrice: parsedCostPrice,
        description: formDescription.trim() || null,
        stock: parsedStock,
        categoryId: formCategoryId.trim() ? parseInt(formCategoryId) : null,
        imageUrls: uploadedImageUrls // Send array of image URLs
      };
      
      // If editing existing product
      if (editingProduct) {
        // Update existing product
        await api.put(
          `/admin/products/${editingProduct.id}`,
          productData
        );
        
        toast.success(`Product "${formName}" updated successfully!`);
      } else {
        // Create new product
        await api.post(
          `/admin/products`,
          productData
        );
        
        toast.success(`Product "${formName}" created successfully!`);
      }
      
      // Success - close modal and refresh
      handleCloseModal();
      fetchProducts();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setModalError(err.response.data.message || 'Failed to save product.');
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
    const adjustmentInt = parseInt(adjustmentStr);
    
    if (isNaN(adjustmentInt)) {
      toast.error('Please enter a valid number for stock adjustment');
      return;
    }
    
    try {
      await api.post(
        `/admin/products/${productId}/adjust-stock`,
        { adjustment: adjustmentInt }
      );
      
      toast.success(`Stock updated successfully`);
      
      // Refresh products to show updated stock
      fetchProducts();
      
      // Reset adjustment state
      setAdjustingProductId(null);
      setAdjustmentValue('');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Failed to adjust stock');
        console.error('Error adjusting stock:', err.response.data);
      } else {
        toast.error('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const handleShowDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      await handleDelete(productToDelete.id);
      handleCloseDeleteModal();
    }
  };
  
  const handleShowStockModal = (product: Product) => {
    setStockProduct(product);
    setStockAdjustment('');
    setShowStockModal(true);
  };
  
  const handleCloseStockModal = () => {
    setShowStockModal(false);
    setStockProduct(null);
    setStockAdjustment('');
  };
  
  const handleStockAdjustmentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (stockProduct && stockAdjustment) {
      await handleAdjustStock(stockProduct.id, stockAdjustment);
      handleCloseStockModal();
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Product Management</h2>
        <Button variant="primary" onClick={handleShowAddModal} className="d-flex align-items-center gap-2">
          <FaPlus size={14} /> Add New Product
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="mt-2 text-muted">Loading products...</p>
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="empty-state">
              <FaBox className="empty-state-icon" />
              <p className="empty-state-text">No Products Found</p>
              <p className="mb-4 text-muted">You haven't added any products yet.</p>
              <Button 
                variant="primary" 
                onClick={handleShowAddModal} 
                className="px-4 d-flex align-items-center gap-2 mx-auto"
              >
                <FaPlus size={14} /> Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover responsive className="align-middle shadow-sm">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>ID</th>
                    <th style={{ width: '80px' }}>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th className="text-end">Price</th>
                    <th className="text-end">Cost Price</th>
                    <th className="text-center">Stock</th>
                    <th style={{ width: '180px' }} className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td className="text-center">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={getImageUrl(product.images[0].url)} 
                            alt={product.name} 
                            className="product-thumbnail rounded shadow-sm" 
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              (e.target as HTMLImageElement).src = getImageUrl("/placeholder.png");
                            }}
                          />
                        ) : (
                          <div className="product-thumbnail d-flex align-items-center justify-content-center bg-light rounded shadow-sm" style={{ width: '50px', height: '50px' }}>
                            <FaImage className="text-secondary" />
                          </div>
                        )}
                      </td>
                      <td>{truncateText(product.name, 30)}</td>
                      <td>
                        {product.category?.name ? (
                          <Badge bg="info" className="fw-normal px-2 py-1">{product.category.name}</Badge>
                        ) : (
                          <span className="text-muted small">Uncategorized</span>
                        )}
                      </td>
                      <td className="text-end fw-medium">{formatCurrency(product.price)}</td>
                      <td className="text-end">{product.costPrice != null ? formatCurrency(product.costPrice) : 'N/A'}</td>
                      <td className="text-center">
                        <Badge 
                          bg={product.stock === undefined || product.stock === null ? 'secondary' : 
                              product.stock <= 0 ? 'danger' : 
                              product.stock < 10 ? 'warning' : 'success'}
                          className="px-2 py-1"
                        >
                          {product.stock === undefined || product.stock === null ? 'N/A' : product.stock}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1 justify-content-end">
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            onClick={() => handleShowStockModal(product)}
                          >
                            Stock
                          </Button>
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
                            onClick={() => handleShowDeleteModal(product)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </>
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
              <Form.Label>Cost Price (Optional)</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formCostPrice}
                  onChange={(e) => setFormCostPrice(e.target.value)}
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
              <Form.Label>Product Images (Up to 5)</Form.Label>
              <Form.Control
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleFileSelection}
                multiple
              />
              <Form.Text className="text-muted">
                Max 5 images total. Max file size: 5MB each. Supported formats: PNG, JPEG, WebP, GIF.
              </Form.Text>
            </Form.Group>
            
            {/* Display selected files */}
            {selectedFiles.length > 0 && (
              <div className="mb-3">
                <p className="mb-1 fw-medium">Selected Images:</p>
                <div className="d-flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div 
                      key={`selected-${index}`} 
                      className="position-relative"
                      style={{ width: '80px', height: '80px' }}
                    >
                      <Image 
                        src={URL.createObjectURL(file)}
                        alt={`Selected ${index + 1}`}
                        className="rounded"
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                      <Button 
                        variant="danger" 
                        size="sm" 
                        className="position-absolute top-0 end-0 rounded-circle p-0 d-flex align-items-center justify-content-center"
                        style={{ width: '24px', height: '24px', transform: 'translate(30%, -30%)' }}
                        onClick={() => handleRemoveSelectedFile(index)}
                      >
                        &times;
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Display existing images when editing */}
            {editingProduct && formImageUrls.length > 0 && (
              <div className="mb-3">
                <p className="mb-1 fw-medium">Current Images:</p>
                <div className="d-flex flex-wrap gap-2">
                  {formImageUrls.map((url, index) => (
                    <div 
                      key={`existing-${index}`} 
                      className="position-relative"
                      style={{ width: '80px', height: '80px' }}
                    >
                      <Image 
                        src={getImageUrl(url)}
                        alt={`Image ${index + 1}`}
                        className="rounded"
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                      <Button 
                        variant="danger" 
                        size="sm" 
                        className="position-absolute top-0 end-0 rounded-circle p-0 d-flex align-items-center justify-content-center"
                        style={{ width: '24px', height: '24px', transform: 'translate(30%, -30%)' }}
                        onClick={() => handleRemoveImageUrl(index)}
                      >
                        &times;
                      </Button>
                    </div>
                  ))}
                </div>
                <small className="text-muted mt-1 d-block">
                  {5 - formImageUrls.length} more image(s) can be added
                </small>
              </div>
            )}
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

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {productToDelete && (
            <p>Are you sure you want to delete <strong>{productToDelete.name}</strong>?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Stock Adjustment Modal */}
      <Modal show={showStockModal} onHide={handleCloseStockModal}>
        <Modal.Header closeButton>
          <Modal.Title>Adjust Stock</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleStockAdjustmentSubmit}>
          <Modal.Body>
            {stockProduct && (
              <>
                <p>
                  Adjust stock for <strong>{stockProduct.name}</strong>
                  <br />
                  <span className="text-muted">Current stock: {stockProduct.stock || 0}</span>
                </p>
                <Form.Group className="mb-3">
                  <Form.Label>Stock adjustment (+ to add, - to remove)</Form.Label>
                  <Form.Control
                    type="number"
                    value={stockAdjustment}
                    onChange={(e) => setStockAdjustment(e.target.value)}
                    placeholder="Enter adjustment value"
                    required
                  />
                  <Form.Text className="text-muted">
                    Example: Enter "5" to add 5 units or "-3" to remove 3 units
                  </Form.Text>
                </Form.Group>
                {stockAdjustment && !isNaN(Number(stockAdjustment)) && (
                  <Alert variant="info">
                    New stock will be: {(stockProduct.stock || 0) + Number(stockAdjustment)}
                  </Alert>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseStockModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ProductManagementPage; 
