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

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginScreen />} />

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

                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
