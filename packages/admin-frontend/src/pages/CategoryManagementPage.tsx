import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import api from '../utils/api';
import { Container, Table, Form, Button, Alert, Spinner, Modal, Row, Col, Toast, ToastContainer } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { FaEdit } from 'react-icons/fa';
import { FaTrashAlt } from 'react-icons/fa';
import { FaExclamationTriangle } from 'react-icons/fa';
import { getImageUrl } from '../utils/imageUrl';

interface Category {
  id: number;
  name: string;
  description: string | null;
  imageUrl?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Image upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  
  // Modal state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  
  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success');
  const [toastMessage, setToastMessage] = useState('');

  const showNotification = (message: string, variant: 'success' | 'danger' = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setError('Authentication required. Please log in again.');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await api.get('/admin/categories', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCategories(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(err.response.data.message || 'Failed to fetch categories.');
        }
        console.error('Error fetching categories:', err.response.data);
      } else {
        setError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowAddModal = () => {
    setFormData({ name: '', description: '' });
    setFormImageUrl('');
    setFormErrors({});
    setIsEditMode(false);
    setEditCategoryId(null);
    setSelectedFile(null);
    setCurrentImageUrl('');
    setUploadError(null);
    setShowAddEditModal(true);
  };

  const handleShowEditModal = (category: Category) => {
    setFormData({ 
      name: category.name, 
      description: category.description || '' 
    });
    setFormImageUrl(category.imageUrl || '');
    setCurrentImageUrl(category.imageUrl || '');
    setFormErrors({});
    setIsEditMode(true);
    setEditCategoryId(category.id);
    setSelectedFile(null);
    setUploadError(null);
    setShowAddEditModal(true);
  };

  const handleShowDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleCloseModals = () => {
    setShowAddEditModal(false);
    setShowDeleteModal(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setUploadError(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    
    const token = localStorage.getItem('admin_token');
    if (!token) {
      showNotification('Authentication required. Please log in again.', 'danger');
      setIsSaving(false);
      return;
    }
    
    let finalImageUrl = isEditMode ? currentImageUrl : null;
    
    // Handle file upload if a file is selected
    if (selectedFile) {
      setIsUploading(true);
      setUploadError(null);
      
      try {
        const formData = new FormData();
        formData.append('productImages', selectedFile); // Using 'productImages' as per existing endpoint
        
        const uploadResponse = await api.post(
          '/admin/upload',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        
        if (uploadResponse.data && uploadResponse.data.imageUrls && uploadResponse.data.imageUrls.length > 0) {
          finalImageUrl = uploadResponse.data.imageUrls[0];
        } else {
          throw new Error('Invalid response from upload API');
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response) {
          setUploadError(err.response.data.message || 'Failed to upload image');
          console.error('Error uploading image:', err.response.data);
        } else {
          setUploadError('Network error. Please check your connection.');
          console.error('Network error:', err);
        }
        setIsSaving(false);
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }
    
    const categoryData = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      imageUrl: finalImageUrl
    };
    
    try {
      if (isEditMode && editCategoryId) {
        await api.put(
          `/admin/categories/${editCategoryId}`,
          categoryData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        showNotification('Category updated successfully!');
      } else {
        await api.post(
          '/admin/categories',
          categoryData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        showNotification('Category created successfully!');
      }
      
      handleCloseModals();
      fetchCategories();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 400) {
          setFormErrors(err.response.data.errors || {});
        } else if (err.response.status === 409) {
          setFormErrors({ name: 'A category with this name already exists.' });
        } else {
          showNotification(err.response.data.message || 'Failed to save category.', 'danger');
        }
        console.error('Error saving category:', err.response.data);
      } else {
        showNotification('Network error. Please check your connection.', 'danger');
        console.error('Network error:', err);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    if (!window.confirm(`Are you sure you want to delete category "${categoryToDelete.name}"? Products in this category might need reassignment. This cannot be undone.`)) {
      return; // Stop if user cancels
    }
    
    setIsDeleting(true);
    
    const token = localStorage.getItem('admin_token');
    if (!token) {
      showNotification('Authentication required. Please log in again.', 'danger');
      setIsDeleting(false);
      return;
    }
    
    try {
      await api.delete(`/admin/categories/${categoryToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      showNotification('Category deleted successfully!');
      handleCloseModals();
      fetchCategories();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 409) {
          showNotification('Cannot delete category with associated products.', 'danger');
        } else {
          showNotification(err.response.data.message || 'Failed to delete category.', 'danger');
        }
        console.error('Error deleting category:', err.response.data);
      } else {
        showNotification('Network error. Please check your connection.', 'danger');
        console.error('Network error:', err);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Container fluid className="py-3">
      <Row className="mb-3 align-items-center">
        <Col>
          <h1 className="h3">Category Management</h1>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={handleShowAddModal}>
            <FaPlus className="me-1" /> Add Category
          </Button>
        </Col>
      </Row>

      {/* Toast notification */}
      <ToastContainer className="p-3" position="top-end">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide 
          bg={toastVariant}
        >
          <Toast.Header closeButton>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body className={toastVariant === 'danger' ? 'text-white' : ''}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {error && <Alert variant="danger">{error}</Alert>}

      {isLoading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading categories...</span>
          </Spinner>
        </div>
      ) : categories.length === 0 ? (
        <Alert variant="info">No categories found. Add a new category to get started.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Description</th>
              <th>Image URL</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>{category.description || '-'}</td>
                <td>{category.imageUrl ? (
                  <a href={getImageUrl(category.imageUrl)} target="_blank" rel="noopener noreferrer" className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>
                    {category.imageUrl}
                  </a>
                ) : (
                  <span className="text-muted">No image</span>
                )}</td>
                <td>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="me-2" 
                    onClick={() => handleShowEditModal(category)}
                  >
                    <FaEdit /> Edit
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => handleShowDeleteModal(category)}
                  >
                    <FaTrashAlt /> Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Add/Edit Category Modal */}
      <Modal show={showAddEditModal} onHide={handleCloseModals}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? 'Edit Category' : 'Add New Category'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveCategory}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium text-neutral-700">Category Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                isInvalid={!!formErrors.name}
                className="py-2"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium text-neutral-700">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                isInvalid={!!formErrors.description}
                className="py-2"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.description}
              </Form.Control.Feedback>
            </Form.Group>
            
            {/* Image Preview Area */}
            {(currentImageUrl || selectedFile) && (
              <div className="mb-3 text-center">
                <img 
                  src={selectedFile ? URL.createObjectURL(selectedFile) : getImageUrl(currentImageUrl)} 
                  alt="Category Preview" 
                  style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain', marginBottom: '10px' }} 
                />
                {selectedFile && <p className="text-muted small">New image selected: {selectedFile.name}</p>}
              </div>
            )}
            
            <Form.Group controlId="categoryImageFile" className="mb-3">
              <Form.Label className="fw-medium text-neutral-700">Category Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleFileChange}
                disabled={isUploading || isSaving}
                className="py-2"
              />
              {isUploading && <Spinner animation="border" size="sm" className="ms-2" />}
              {uploadError && <Alert variant="danger" className="mt-2">{uploadError}</Alert>}
              <Form.Text className="text-muted">
                Upload a new image (optional). Max 5MB. Replaces existing image if provided.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium text-neutral-700">Image URL</Form.Label>
              <Form.Control
                type="text"
                name="imageUrl"
                placeholder="https://example.com/image.png"
                value={formImageUrl}
                onChange={(e) => {
                  setFormImageUrl(e.target.value);
                  setCurrentImageUrl(e.target.value);
                  // Clear selected file when URL is entered manually
                  if (e.target.value) {
                    setSelectedFile(null);
                  }
                  // Clear error when user types
                  if (formErrors.imageUrl) {
                    setFormErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.imageUrl;
                      return newErrors;
                    });
                  }
                }}
                isInvalid={!!formErrors.imageUrl}
                className="py-2"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.imageUrl}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Optional. You can either upload an image or enter a URL directly.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModals}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isSaving || isUploading}
              className="py-2"
            >
              {isSaving || isUploading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  {isUploading ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                'Save Category'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseModals}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex align-items-center mb-3">
            <FaExclamationTriangle className="text-warning me-2" size={20} />
            <span>Are you sure you want to delete this category?</span>
          </div>
          {categoryToDelete && (
            <Alert variant="secondary">
              <strong>{categoryToDelete.name}</strong>
              {categoryToDelete.description && (
                <p className="mb-0 mt-1">{categoryToDelete.description}</p>
              )}
            </Alert>
          )}
          <p className="mb-0 text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteCategory} 
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-1"
                />
                Deleting...
              </>
            ) : (
              'Delete Category'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CategoryManagementPage; 