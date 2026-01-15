import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginScreen from './components/auth/LoginScreen';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminDashboard from './pages/AdminDashboard';
import SalesDashboard from './pages/SalesDashboard';
import OperationsDashboard from './pages/OperationsDashboard';
import ProductManagement from './pages/ProductManagement';
import QuotationManagement from './pages/QuotationManagement';
import EmailsPage from './pages/EmailsPage';
import RequestsPage from './pages/RequestsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginScreen />} />

                    {/* Dashboard routes for each role */}
                    <Route
                        path="/admin"
                        element={
                            <PrivateRoute allowedRoles={['Admin']}>
                                <AdminDashboard />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/sales"
                        element={
                            <PrivateRoute allowedRoles={['Sales']}>
                                <SalesDashboard />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/operations"
                        element={
                            <PrivateRoute allowedRoles={['Operations']}>
                                <OperationsDashboard />
                            </PrivateRoute>
                        }
                    />

                    {/* Shared pages accessible by all roles */}
                    <Route
                        path="/products"
                        element={
                            <PrivateRoute allowedRoles={['Admin', 'Sales', 'Operations']}>
                                <ProductManagement />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/quotations"
                        element={
                            <PrivateRoute allowedRoles={['Admin', 'Sales', 'Operations']}>
                                <QuotationManagement />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/emails"
                        element={
                            <PrivateRoute allowedRoles={['Admin', 'Sales', 'Operations']}>
                                <EmailsPage />
                            </PrivateRoute>
                        }
                    />

                    {/* Requests routes for each role */}
                    <Route
                        path="/admin/requests"
                        element={
                            <PrivateRoute allowedRoles={['Admin']}>
                                <RequestsPage />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/sales/requests"
                        element={
                            <PrivateRoute allowedRoles={['Sales']}>
                                <RequestsPage />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/operations/requests"
                        element={
                            <PrivateRoute allowedRoles={['Operations']}>
                                <RequestsPage />
                            </PrivateRoute>
                        }
                    />

                    {/* Analytics routes for each role */}
                    <Route
                        path="/admin/analytics"
                        element={
                            <PrivateRoute allowedRoles={['Admin']}>
                                <AnalyticsPage />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/sales/analytics"
                        element={
                            <PrivateRoute allowedRoles={['Sales']}>
                                <AnalyticsPage />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/operations/analytics"
                        element={
                            <PrivateRoute allowedRoles={['Operations']}>
                                <AnalyticsPage />
                            </PrivateRoute>
                        }
                    />

                    {/* Admin-only pages */}
                    <Route
                        path="/admin/users"
                        element={
                            <PrivateRoute allowedRoles={['Admin']}>
                                <UsersPage />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/admin/settings"
                        element={
                            <PrivateRoute allowedRoles={['Admin']}>
                                <SettingsPage />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/settings"
                        element={
                            <PrivateRoute allowedRoles={['Admin', 'Sales', 'Operations']}>
                                <SettingsPage />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute allowedRoles={['Admin', 'Sales', 'Operations']}>
                                <SettingsPage />
                            </PrivateRoute>
                        }
                    />

                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
