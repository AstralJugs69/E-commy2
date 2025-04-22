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
const ChartLoadingFallback = () => (
  <div className="d-flex justify-content-center align-items-center py-4">
    <Spinner animation="border" variant="primary" />
  </div>
);

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
          setError('Authentication token not found. Please log in again.');
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
            setError('Your session has expired. Please log in again.');
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          } else if (err.response) {
            setError(err.response.data.message || 'Failed to fetch dashboard data');
            console.error('Error fetching dashboard data:', err.response.data);
          } else {
            setError('Network error. Please check your connection.');
            console.error('Network error:', err);
          }
        } else {
          setError('An unexpected error occurred.');
          console.error('Error fetching dashboard data:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Fetch sales data for chart
  useEffect(() => {
    const fetchSalesChartData = async () => {
      setIsSalesChartLoading(true);
      setSalesChartError(null);
      
      try {
        const admin_token = localStorage.getItem('admin_token');
        
        if (!admin_token) {
          setSalesChartError('Authentication token not found.');
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
                label: 'Total Sales (€)',
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
          setSalesChartError('Invalid data format received from server.');
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 401) {
            setSalesChartError('Your session has expired.');
          } else if (err.response) {
            setSalesChartError(err.response.data.message || 'Failed to fetch sales data');
            console.error('Error fetching sales data:', err.response.data);
          } else {
            setSalesChartError('Network error. Please check your connection.');
            console.error('Network error:', err);
          }
        } else {
          setSalesChartError('An unexpected error occurred.');
          console.error('Error fetching sales data:', err);
        }
      } finally {
        setIsSalesChartLoading(false);
      }
    };

    fetchSalesChartData();
  }, [timePeriod]);

  // Fetch users data for chart
  useEffect(() => {
    const fetchUsersChartData = async () => {
      setIsUsersChartLoading(true);
      setUsersChartError(null);
      
      try {
        const admin_token = localStorage.getItem('admin_token');
        
        if (!admin_token) {
          setUsersChartError('Authentication token not found.');
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
                label: 'New Users',
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
          setUsersChartError('Invalid data format received from server.');
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 401) {
            setUsersChartError('Your session has expired.');
          } else if (err.response) {
            setUsersChartError(err.response.data.message || 'Failed to fetch user data');
            console.error('Error fetching user data:', err.response.data);
          } else {
            setUsersChartError('Network error. Please check your connection.');
            console.error('Network error:', err);
          }
        } else {
          setUsersChartError('An unexpected error occurred.');
          console.error('Error fetching user data:', err);
        }
      } finally {
        setIsUsersChartLoading(false);
      }
    };

    fetchUsersChartData();
  }, [timePeriod]);

  // Prepare chart data for order status breakdown
  const chartData = {
    labels: ['Pending', 'Verified', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    datasets: [
      {
        label: 'Orders by Status',
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
        text: 'Order Status Distribution',
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
        text: 'Sales Over Time',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-EU', {
                style: 'currency',
                currency: 'EUR'
              }).format(context.parsed.y);
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
            return '€' + value;
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
        text: 'User Registrations',
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
            <span className="visually-hidden">Loading statistics...</span>
          </Spinner>
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
        <h2 className="mb-0">Statistics & Reports</h2>
      </div>
      
      {/* Revenue and Orders Stats - First Row */}
      <Row className="mb-4 g-3">
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm dashboard-stat-card">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Revenue</h6>
                  <h3 className="mb-0">{stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : '€0.00'}</h3>
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
                    <h6 className="text-muted mb-1">Total Orders</h6>
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
                    <h6 className="text-muted mb-1">Last 7 Days</h6>
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
                    <h6 className="text-muted mb-1">Total Products</h6>
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
                <h6 className="text-muted mb-0">Pending</h6>
                <h3 className="mb-0">{stats?.pendingOrders ?? '-'}</h3>
                <Badge bg="secondary" className="mt-2">Pending Call</Badge>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        
        <Col md={6} lg={2}>
          <Link to="/admin/orders?status=Verified" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <h6 className="text-muted mb-0">Verified</h6>
                <h3 className="mb-0">{stats?.verifiedOrders ?? '-'}</h3>
                <Badge bg="primary" className="mt-2">Verified</Badge>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        
        <Col md={6} lg={2}>
          <Link to="/admin/orders?status=Processing" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <h6 className="text-muted mb-0">Processing</h6>
                <h3 className="mb-0">{stats?.processingOrders ?? '-'}</h3>
                <Badge bg="warning" className="mt-2">Processing</Badge>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        <Col md={6} lg={2}>
          <Link to="/admin/orders?status=Shipped" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <h6 className="text-muted mb-0">Shipped</h6>
                <h3 className="mb-0">{stats?.shippedOrders ?? '-'}</h3>
                <Badge bg="info" className="mt-2">Shipped</Badge>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        <Col md={6} lg={2}>
          <Link to="/admin/orders?status=Delivered" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <h6 className="text-muted mb-0">Delivered</h6>
                <h3 className="mb-0">{stats?.deliveredOrders ?? '-'}</h3>
                <Badge bg="success" className="mt-2">Delivered</Badge>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        <Col md={6} lg={2}>
          <Link to="/admin/orders?status=Cancelled" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <h6 className="text-muted mb-0">Cancelled</h6>
                <h3 className="mb-0">{stats?.cancelledOrders ?? '-'}</h3>
                <Badge bg="danger" className="mt-2">Cancelled</Badge>
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
              <h5 className="mb-0">Order Status Distribution</h5>
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
                <h5 className="mb-0">Sales Over Time</h5>
                <Form.Select 
                  className="w-auto" 
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  aria-label="Select time period"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="6m">Last 6 Months</option>
                </Form.Select>
              </div>
            </Card.Header>
            <Card.Body>
              {isSalesChartLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading chart data...</span>
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
                <div className="text-center py-3">No sales data available.</div>
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
                <h5 className="mb-0">User Registrations</h5>
              </div>
            </Card.Header>
            <Card.Body>
              {isUsersChartLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading chart data...</span>
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
                <div className="text-center py-3">No user data available.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StatisticsPage; 