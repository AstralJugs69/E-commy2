import React, { useEffect, useState, lazy, Suspense } from 'react';
import api from '../utils/api';
import axios from 'axios'; // Keep for error type checking
import { Container, Row, Col, Card, Alert, Spinner, Form, Badge } from 'react-bootstrap';
import { FaUsers } from 'react-icons/fa';
import { FaShoppingCart } from 'react-icons/fa';
import { FaBox } from 'react-icons/fa';
import { FaDollarSign } from 'react-icons/fa';
import { FaCalendarAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// Import ChartJS dependencies but lazy load the actual chart components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format, parseISO, subDays, subMonths } from 'date-fns';
import { formatCurrency } from '../utils/formatters';

// Lazy load chart components
const Bar = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Bar })));
const Line = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Line })));

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Chart loading fallback component
const ChartLoadingFallback = () => {
  const { t } = useTranslation();
  return (
    <div className="d-flex justify-content-center align-items-center py-4">
      <Spinner animation="border" variant="primary" />
      <span className="visually-hidden">{t("common.loading")}</span>
    </div>
  );
};

interface AdminStats {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  verifiedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  availablePhones: number;
  totalZones: number;
  totalRevenue: number;
  ordersLast7Days: number;
  recentOrders: {
    id: number;
    customerName: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }[];
}

const StatisticsPage: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Sales chart state
  const [salesChartData, setSalesChartData] = useState<any>(null);
  const [salesChartError, setSalesChartError] = useState<string | null>(null);
  const [isSalesChartLoading, setIsSalesChartLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<string>('30d');
  
  // Users chart state
  const [usersChartData, setUsersChartData] = useState<any>(null);
  const [usersChartError, setUsersChartError] = useState<string | null>(null);
  const [isUsersChartLoading, setIsUsersChartLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const admin_token = localStorage.getItem('admin_token');
        
        if (!admin_token) {
          setError(t('statistics.errors.authTokenMissing'));
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }

        const token = admin_token.startsWith('Bearer ') 
          ? admin_token 
          : `Bearer ${admin_token}`;
        
        const response = await api.get('/admin/stats', {
          headers: {
            Authorization: token
          }
        });
        
        setStats(response.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 401) {
            // Handle unauthorized error
            localStorage.removeItem('admin_token');
            setError(t('statistics.errors.sessionExpired'));
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          } else if (err.response) {
            setError(err.response.data.message || t('statistics.errors.fetchFailed'));
            console.error('Error fetching dashboard data:', err.response.data);
          } else {
            setError(t('statistics.errors.networkError'));
            console.error('Network error:', err);
          }
        } else {
          setError(t('statistics.errors.unexpected'));
          console.error('Error fetching dashboard data:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, t]);

  // Fetch sales data for chart
  useEffect(() => {
    const fetchSalesChartData = async () => {
      setIsSalesChartLoading(true);
      setSalesChartError(null);
      
      try {
        const admin_token = localStorage.getItem('admin_token');
        
        if (!admin_token) {
          setSalesChartError(t('statistics.errors.authTokenMissing'));
          return;
        }

        // Calculate date range based on selected period
        let startDate;
        const endDate = new Date();
        
        switch (timePeriod) {
          case '7d':
            startDate = subDays(endDate, 7);
            break;
          case '30d':
            startDate = subDays(endDate, 30);
            break;
          case '90d':
            startDate = subDays(endDate, 90);
            break;
          case '6m':
            startDate = subMonths(endDate, 6);
            break;
          default:
            startDate = subDays(endDate, 30);
        }
        
        // Format dates for API
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');

        const token = admin_token.startsWith('Bearer ') 
          ? admin_token 
          : `Bearer ${admin_token}`;
        
        // Fetch sales data from the reports API
        const response = await api.get(`/admin/reports/sales-over-time?startDate=${formattedStartDate}&endDate=${formattedEndDate}`, {
          headers: {
            Authorization: token
          }
        });
        
        // Transform the data for chartjs
        if (response.data && Array.isArray(response.data)) {
          const labels = response.data.map(item => format(parseISO(item.date), 'MMM dd'));
          const salesValues = response.data.map(item => item.totalSales || 0);
          
          setSalesChartData({
            labels,
            datasets: [
              {
                label: t('statistics.charts.sales.label'),
                data: salesValues,
                borderColor: 'rgba(25, 135, 84, 1)', // success green
                backgroundColor: 'rgba(25, 135, 84, 0.2)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
              }
            ]
          });
        } else {
          setSalesChartError(t('statistics.errors.invalidDataFormat'));
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 401) {
            setSalesChartError(t('statistics.errors.sessionExpired'));
          } else if (err.response) {
            setSalesChartError(err.response.data.message || t('statistics.errors.salesDataFetchFailed'));
            console.error('Error fetching sales data:', err.response.data);
          } else {
            setSalesChartError(t('statistics.errors.networkError'));
            console.error('Network error:', err);
          }
        } else {
          setSalesChartError(t('statistics.errors.unexpected'));
          console.error('Error fetching sales data:', err);
        }
      } finally {
        setIsSalesChartLoading(false);
      }
    };

    fetchSalesChartData();
  }, [timePeriod, t]);

  // Fetch users data for chart
  useEffect(() => {
    const fetchUsersChartData = async () => {
      setIsUsersChartLoading(true);
      setUsersChartError(null);
      
      try {
        const admin_token = localStorage.getItem('admin_token');
        
        if (!admin_token) {
          setUsersChartError(t('statistics.errors.authTokenMissing'));
          return;
        }

        // Calculate date range based on selected period
        let startDate;
        const endDate = new Date();
        
        switch (timePeriod) {
          case '7d':
            startDate = subDays(endDate, 7);
            break;
          case '30d':
            startDate = subDays(endDate, 30);
            break;
          case '90d':
            startDate = subDays(endDate, 90);
            break;
          case '6m':
            startDate = subMonths(endDate, 6);
            break;
          default:
            startDate = subDays(endDate, 30);
        }
        
        // Format dates for API
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');

        const token = admin_token.startsWith('Bearer ') 
          ? admin_token 
          : `Bearer ${admin_token}`;
        
        // Fetch users data from the reports API
        const response = await api.get(`/admin/reports/users-over-time?startDate=${formattedStartDate}&endDate=${formattedEndDate}`, {
          headers: {
            Authorization: token
          }
        });
        
        // Transform the data for chartjs
        if (response.data && Array.isArray(response.data)) {
          const labels = response.data.map(item => format(parseISO(item.date), 'MMM dd'));
          const userValues = response.data.map(item => item.newUsers || 0);
          
          setUsersChartData({
            labels,
            datasets: [
              {
                label: t('statistics.charts.users.label'),
                data: userValues,
                borderColor: 'rgba(13, 110, 253, 1)', // primary blue
                backgroundColor: 'rgba(13, 110, 253, 0.2)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
              }
            ]
          });
        } else {
          setUsersChartError(t('statistics.errors.invalidDataFormat'));
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 401) {
            setUsersChartError(t('statistics.errors.sessionExpired'));
          } else if (err.response) {
            setUsersChartError(err.response.data.message || t('statistics.errors.userDataFetchFailed'));
            console.error('Error fetching user data:', err.response.data);
          } else {
            setUsersChartError(t('statistics.errors.networkError'));
            console.error('Network error:', err);
          }
        } else {
          setUsersChartError(t('statistics.errors.unexpected'));
          console.error('Error fetching user data:', err);
        }
      } finally {
        setIsUsersChartLoading(false);
      }
    };

    fetchUsersChartData();
  }, [timePeriod, t]);

  // Prepare chart data for order status breakdown
  const chartData = {
    labels: [
      t('statistics.orderStatus.pending'), 
      t('statistics.orderStatus.verified'), 
      t('statistics.orderStatus.processing'), 
      t('statistics.orderStatus.shipped'), 
      t('statistics.orderStatus.delivered'), 
      t('statistics.orderStatus.cancelled')
    ],
    datasets: [
      {
        label: t('statistics.charts.orderStatus.label'),
        data: stats ? [
          stats.pendingOrders,
          stats.verifiedOrders,
          stats.processingOrders,
          stats.shippedOrders,
          stats.deliveredOrders,
          stats.cancelledOrders
        ] : [],
        backgroundColor: [
          'rgba(108, 117, 125, 0.6)', // secondary
          'rgba(13, 110, 253, 0.6)',  // primary
          'rgba(255, 193, 7, 0.6)',   // warning
          'rgba(13, 202, 240, 0.6)',  // info
          'rgba(25, 135, 84, 0.6)',   // success
          'rgba(220, 53, 69, 0.6)'    // danger
        ],
        borderColor: [
          'rgba(108, 117, 125, 1)',
          'rgba(13, 110, 253, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(13, 202, 240, 1)',
          'rgba(25, 135, 84, 1)',
          'rgba(220, 53, 69, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: t('statistics.charts.orderStatus.title'),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0 // Only show whole numbers
        }
      }
    }
  };

  // Sales chart options
  const salesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: t('statistics.charts.sales.title'),
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  // Users chart options
  const usersChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: t('statistics.charts.users.title'),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0 // Only show whole numbers
        }
      }
    }
  };

  if (isLoading) {
    return (
      <Container className="py-4">
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">{t('common.loading')}</span>
          </Spinner>
          <p className="mt-3">{t('statistics.loadingMessage')}</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger" className="my-4">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">{t('statistics.pageTitle')}</h2>
      </div>
      
      {/* Revenue and Orders Stats - First Row */}
      <Row className="mb-4 g-3">
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm dashboard-stat-card">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">{t('statistics.cards.totalRevenue')}</h6>
                  <h3 className="mb-0">{stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : formatCurrency(0)}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <FaDollarSign className="text-success" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3}>
          <Link to="/admin/orders" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">{t('statistics.cards.totalOrders')}</h6>
                    <h3 className="mb-0">{stats?.totalOrders ?? '-'}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <FaShoppingCart className="text-primary" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        
        <Col md={6} lg={3}>
          <Link to="/admin/orders" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">{t('statistics.cards.last7Days')}</h6>
                    <h3 className="mb-0">{stats?.ordersLast7Days ?? '-'}</h3>
                  </div>
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <FaCalendarAlt className="text-info" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        
        <Col md={6} lg={3}>
          <Link to="/admin/products" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">{t('statistics.cards.totalProducts')}</h6>
                    <h3 className="mb-0">{stats?.totalProducts ?? '-'}</h3>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded">
                    <FaBox className="text-warning" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>
      </Row>
      
      {/* Order Status Stats - Second Row */}
      <Row className="mb-4 g-3">
        <Col md={6} lg={2}>
          <Link to="/admin/orders?status=Pending+Call" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <h6 className="text-muted mb-0">{t('statistics.orderStatus.pending')}</h6>
                <h3 className="mb-0">{stats?.pendingOrders ?? '-'}</h3>
                <Badge bg="secondary" className="mt-2">{t('statistics.orderStatus.pendingCall')}</Badge>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        
        <Col md={6} lg={2}>
          <Link to="/admin/orders?status=Verified" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <h6 className="text-muted mb-0">{t('statistics.orderStatus.verified')}</h6>
                <h3 className="mb-0">{stats?.verifiedOrders ?? '-'}</h3>
                <Badge bg="primary" className="mt-2">{t('statistics.orderStatus.verified')}</Badge>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        
        <Col md={6} lg={2}>
          <Link to="/admin/orders?status=Processing" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <h6 className="text-muted mb-0">{t('statistics.orderStatus.processing')}</h6>
                <h3 className="mb-0">{stats?.processingOrders ?? '-'}</h3>
                <Badge bg="warning" className="mt-2">{t('statistics.orderStatus.processing')}</Badge>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        <Col md={6} lg={2}>
          <Link to="/admin/orders?status=Shipped" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <h6 className="text-muted mb-0">{t('statistics.orderStatus.shipped')}</h6>
                <h3 className="mb-0">{stats?.shippedOrders ?? '-'}</h3>
                <Badge bg="info" className="mt-2">{t('statistics.orderStatus.shipped')}</Badge>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        <Col md={6} lg={2}>
          <Link to="/admin/orders?status=Delivered" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <h6 className="text-muted mb-0">{t('statistics.orderStatus.delivered')}</h6>
                <h3 className="mb-0">{stats?.deliveredOrders ?? '-'}</h3>
                <Badge bg="success" className="mt-2">{t('statistics.orderStatus.delivered')}</Badge>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        <Col md={6} lg={2}>
          <Link to="/admin/orders?status=Cancelled" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <h6 className="text-muted mb-0">{t('statistics.orderStatus.cancelled')}</h6>
                <h3 className="mb-0">{stats?.cancelledOrders ?? '-'}</h3>
                <Badge bg="danger" className="mt-2">{t('statistics.orderStatus.cancelled')}</Badge>
              </Card.Body>
            </Card>
          </Link>
        </Col>
      </Row>
      
      {/* Order Status Chart */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-transparent py-3">
              <h5 className="mb-0">{t('statistics.charts.orderStatus.title')}</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <Suspense fallback={<ChartLoadingFallback />}>
                  {stats && <Bar data={chartData} options={chartOptions} />}
                </Suspense>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sales Over Time Chart */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-transparent py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{t('statistics.charts.sales.title')}</h5>
                <Form.Select 
                  className="w-auto" 
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  aria-label={t('statistics.timePeriod.ariaLabel')}
                >
                  <option value="7d">{t('statistics.timePeriod.last7Days')}</option>
                  <option value="30d">{t('statistics.timePeriod.last30Days')}</option>
                  <option value="90d">{t('statistics.timePeriod.last90Days')}</option>
                  <option value="6m">{t('statistics.timePeriod.last6Months')}</option>
                </Form.Select>
              </div>
            </Card.Header>
            <Card.Body>
              {isSalesChartLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">{t('common.loading')}</span>
                  </Spinner>
                </div>
              ) : salesChartError ? (
                <Alert variant="danger">{salesChartError}</Alert>
              ) : salesChartData ? (
                <div style={{ height: '300px' }}>
                  <Suspense fallback={<ChartLoadingFallback />}>
                    <Line data={salesChartData} options={salesChartOptions} />
                  </Suspense>
                </div>
              ) : (
                <div className="text-center py-3">{t('statistics.charts.sales.noData')}</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Registrations Chart */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-transparent py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{t('statistics.charts.users.title')}</h5>
              </div>
            </Card.Header>
            <Card.Body>
              {isUsersChartLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">{t('common.loading')}</span>
                  </Spinner>
                </div>
              ) : usersChartError ? (
                <Alert variant="danger">{usersChartError}</Alert>
              ) : usersChartData ? (
                <div style={{ height: '300px' }}>
                  <Suspense fallback={<ChartLoadingFallback />}>
                    <Line data={usersChartData} options={usersChartOptions} />
                  </Suspense>
                </div>
              ) : (
                <div className="text-center py-3">{t('statistics.charts.users.noData')}</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StatisticsPage; 