import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Container, Table, Button, Alert, Spinner, Modal, Form, InputGroup, Image, Badge, Row, Col, Card, Tabs, Tab, Pagination } from 'react-bootstrap';
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
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import axios from 'axios';
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

const ProductManagementPage: React.FC = () => {
  // Products list state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination, sorting, and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');

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

  // Debounce search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== searchInputValue) {
        setSearchTerm(searchInputValue);
        fetchProducts(1, searchInputValue);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInputValue]);

  const fetchCategories = async () => {
    setIsCategoriesLoading(true);
    setCategoriesError(null);
    
    try {
      const response = await api.get('/admin/categories');
      setCategories(response.data);
    } catch (err: unknown) {
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

  const fetchProducts = async (
    page: number = currentPage, 
    search: string = searchTerm, 
    newSortBy: string = sortBy, 
    newSortOrder: 'asc' | 'desc' = sortOrder
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', itemsPerPage.toString());
      params.append('sortBy', newSortBy);
      params.append('sortOrder', newSortOrder);
      
      if (search.trim()) {
        params.append('search', search.trim());
      }

      // Use admin endpoint with query parameters
      const response = await api.get(`/admin/products?${params.toString()}`);
      
      // Update products state with data
      setProducts(response.data.data);
      
      // Update pagination state
      setCurrentPage(response.data.meta.currentPage);
      setTotalPages(response.data.meta.totalPages);
      setTotalItems(response.data.meta.totalItems);
      setItemsPerPage(response.data.meta.itemsPerPage);
      
      // Update sorting state if changed
      if (newSortBy !== sortBy) setSortBy(newSortBy);
      if (newSortOrder !== sortOrder) setSortOrder(newSortOrder);
      
    } catch (err: unknown) {
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
      await api.delete(`/admin/products/${productId}`);
      
      // Refresh product list
      fetchProducts();
    } catch (err: unknown) {
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
    
    const uploadResponse = await api.post(
      '/admin/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
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
        } catch (err: unknown) {
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
    } catch (err: unknown) {
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
    } catch (err: unknown) {
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

  // Handle sorting column click
  const handleSortColumn = (column: string) => {
    const newSortOrder = column === sortBy && sortOrder === 'desc' ? 'asc' : 'desc';
    fetchProducts(1, searchTerm, column, newSortOrder);
  };

  // Get sort icon for column header
  const getSortIcon = (column: string) => {
    if (column !== sortBy) return <FaSort className="ms-1 text-muted" size={12} />;
    return sortOrder === 'asc' ? <FaSortUp className="ms-1" size={14} /> : <FaSortDown className="ms-1" size={14} />;
  };

  // Create clickable column header
  const SortableColumnHeader = ({ column, label }: { column: string, label: string }) => (
    <div 
      className="d-flex align-items-center" 
      style={{ cursor: 'pointer' }} 
      onClick={() => handleSortColumn(column)}
    >
      {label}
      {getSortIcon(column)}
    </div>
  );

  // Handle search clear
  const handleClearSearch = () => {
    setSearchInputValue('');
    setSearchTerm('');
    fetchProducts(1, '');
  };

  // Render pagination items
  const renderPaginationItems = () => {
    const items = [];

    // Add First and Previous buttons
    items.push(
      <Pagination.First 
        key="first" 
        disabled={currentPage === 1} 
        onClick={() => fetchProducts(1)} 
      />
    );
    items.push(
      <Pagination.Prev 
        key="prev" 
        disabled={currentPage === 1} 
        onClick={() => fetchProducts(currentPage - 1)} 
      />
    );

    // Add page numbers with ellipsis for large ranges
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Adjust when near the end
    if (endPage - startPage < 4 && totalPages > 5) {
      startPage = Math.max(1, endPage - 4);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => fetchProducts(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis1" />);
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item 
          key={i} 
          active={i === currentPage} 
          onClick={() => fetchProducts(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis2" />);
      }
      items.push(
        <Pagination.Item 
          key={totalPages} 
          onClick={() => fetchProducts(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    // Add Next and Last buttons
    items.push(
      <Pagination.Next 
        key="next" 
        disabled={currentPage === totalPages} 
        onClick={() => fetchProducts(currentPage + 1)} 
      />
    );
    items.push(
      <Pagination.Last 
        key="last" 
        disabled={currentPage === totalPages} 
        onClick={() => fetchProducts(totalPages)} 
      />
    );

    return items;
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

      {/* Search input */}
      <div className="mb-4">
        <InputGroup>
          <Form.Control
            placeholder="Search products by name..."
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
          />
          <Button variant="outline-secondary" onClick={handleClearSearch}>
            <FaTimes />
          </Button>
          <Button variant="primary" onClick={() => fetchProducts(1, searchInputValue)}>
            <FaSearch />
          </Button>
        </InputGroup>
      </div>

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
              <p className="mb-4 text-muted">{searchTerm ? 'No products match your search criteria.' : 'You haven\'t added any products yet.'}</p>
              {!searchTerm && (
                <Button 
                  variant="primary" 
                  onClick={handleShowAddModal} 
                  className="px-4 d-flex align-items-center gap-2 mx-auto"
                >
                  <FaPlus size={14} /> Add Your First Product
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover responsive className="align-middle shadow-sm">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>
                        <SortableColumnHeader column="id" label="ID" />
                      </th>
                      <th style={{ width: '80px' }}>Image</th>
                      <th>
                        <SortableColumnHeader column="name" label="Name" />
                      </th>
                      <th>Category</th>
                      <th className="text-end">
                        <div className="d-flex justify-content-end">
                          <SortableColumnHeader column="price" label="Price" />
                        </div>
                      </th>
                      <th className="text-end">Cost Price</th>
                      <th className="text-center">
                        <div className="d-flex justify-content-center">
                          <SortableColumnHeader column="stock" label="Stock" />
                        </div>
                      </th>
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
                              variant="danger" 
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

              {/* Pagination controls */}
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="text-muted">
                  Showing {products.length} of {totalItems} products 
                  {searchTerm && <span> (filtered by "{searchTerm}")</span>}
                </div>
                <Pagination>{renderPaginationItems()}</Pagination>
              </div>
            </>
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
              <Form.Label className="fw-medium text-neutral-700">Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Product Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="py-2"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium text-neutral-700">Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  required
                  className="py-2"
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium text-neutral-700">Cost Price (Optional)</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formCostPrice}
                  onChange={(e) => setFormCostPrice(e.target.value)}
                  className="py-2"
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium text-neutral-700">Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Product Description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="py-2"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium text-neutral-700">Stock (Optional)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Stock Quantity"
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
                className="py-2"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="productImageFile">
              <Form.Label className="fw-medium text-neutral-700">Product Images (Up to 5)</Form.Label>
              <Form.Control
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleFileSelection}
                multiple
                className="py-2"
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
              <Form.Label className="fw-medium text-neutral-700">Category (Optional)</Form.Label>
              <Form.Select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                className="py-2"
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
              className="py-2"
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
          <Button variant="danger" onClick={handleConfirmDelete} className="py-2">
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
                  <Form.Label className="fw-medium text-neutral-700">Stock adjustment (+ to add, - to remove)</Form.Label>
                  <Form.Control
                    type="number"
                    value={stockAdjustment}
                    onChange={(e) => setStockAdjustment(e.target.value)}
                    placeholder="Enter adjustment value"
                    required
                    className="py-2"
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
            <Button variant="primary" type="submit" className="py-2">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ProductManagementPage; 
