import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Form, Button, Alert, Spinner, Modal, Row, Col, Toast, ToastContainer } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa';

interface Category {
  id: number;
  name: string;
  description: string | null;
  imageUrl?: string;
}

const API_BASE_URL = 'http://localhost:3001';

const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  
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
      const response = await axios.get(`${API_BASE_URL}/api/admin/categories`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCategories(response.data);
    } catch (err) {
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
    setShowAddEditModal(true);
  };

  const handleShowEditModal = (category: Category) => {
    setFormData({ 
      name: category.name, 
      description: category.description || '' 
    });
    setFormImageUrl(category.imageUrl || '');
    setFormErrors({});
    setIsEditMode(true);
    setEditCategoryId(category.id);
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
    
    const categoryData = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      imageUrl: formImageUrl.trim() || null
    };
    
    try {
      if (isEditMode && editCategoryId) {
        await axios.put(
          `${API_BASE_URL}/api/admin/categories/${editCategoryId}`,
          categoryData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        showNotification('Category updated successfully!');
      } else {
        await axios.post(
          `${API_BASE_URL}/api/admin/categories`,
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
    } catch (err) {
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
      await axios.delete(`${API_BASE_URL}/api/admin/categories/${categoryToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      showNotification('Category deleted successfully!');
      handleCloseModals();
      fetchCategories();
    } catch (err) {
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
                  <a href={category.imageUrl} target="_blank" rel="noopener noreferrer" className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>
                    {category.imageUrl}
                  </a>
                ) : '-'}</td>
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
                    variant="outline-danger" 
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
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                isInvalid={!!formErrors.name}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                isInvalid={!!formErrors.description}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.description}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="text"
                placeholder="https://example.com/image.png"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                isInvalid={!!formErrors.imageUrl}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.imageUrl}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Optional. Enter a valid URL for the category image.
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
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-1"
                  />
                  Saving...
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