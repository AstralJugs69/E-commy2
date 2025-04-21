import React, { useState } from 'react';
import { Card, Form, Row, Col, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface ShippingAddressFormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  initialData: any;
  buttonText?: string;
}

const ShippingAddressForm: React.FC<ShippingAddressFormProps> = ({ 
  onSubmit, 
  initialData, 
  buttonText
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialData);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(event);
  };

  return (
    <Card className="shadow-sm mb-4">
      <Card.Header className="bg-light py-3">
        <h5 className="mb-0 fw-semibold">{t('checkout.shippingAddress')}</h5>
      </Card.Header>
      <Card.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium text-neutral-700">{t('checkout.fullName', 'Full Name')}</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="py-2"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium text-neutral-700">{t('checkout.phoneNumber')}</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="py-2"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium text-neutral-700">{t('checkout.district')}</Form.Label>
                <Form.Control
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  className="py-2"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium text-neutral-700">{t('checkout.area', 'Area')}</Form.Label>
                <Form.Control
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  required
                  className="py-2"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Label className="fw-medium text-neutral-700">{t('checkout.detailedAddress', 'Detailed Address')}</Form.Label>
            <Form.Control
              as="textarea"
              name="details"
              value={formData.details}
              onChange={handleChange}
              required
              rows={3}
              className="py-2"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Check
              type="checkbox"
              id="setAsDefault"
              name="isDefault"
              label={t('account.setAsDefault')}
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="fw-medium"
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button type="submit" variant="primary" className="px-4 py-2 rounded-pill">
              {buttonText || t('common.save')}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ShippingAddressForm; 