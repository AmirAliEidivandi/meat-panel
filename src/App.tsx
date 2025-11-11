import { useEffect, useState } from 'react';
import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from 'react-router-dom';
import CargoHistory from './components/CargoHistory';
import Categories from './components/Categories';
import CategoryDetails from './components/CategoryDetails';
import CustomerDetails from './components/CustomerDetails';
import CustomerRequests from './components/CustomerRequests';
import CustomerRequestDetails from './components/CustomerRequestDetails';
import Customers from './components/Customers';
import CustomersByDebt from './components/CustomersByDebt';
import CustomersReport from './components/CustomersReport';
import CustomerStats from './components/CustomerStats';
import EmployeeProfiles from './components/EmployeeProfiles';
import InvoiceDetails from './components/InvoiceDetails';
import InvoiceHistory from './components/InvoiceHistory';
import InvoiceHistoryDetails from './components/InvoiceHistoryDetails';
import Invoices from './components/Invoices';
import Login from './components/Login';
import NonEmployeeProfiles from './components/NonEmployeeProfiles';
import OrderDetails from './components/OrderDetails';
import OrderHistory from './components/OrderHistory';
import OrderHistoryDetails from './components/OrderHistoryDetails';
import Orders from './components/Orders';
import OrderStats from './components/OrderStats';
import PaymentDetails from './components/PaymentDetails';
import PaymentHistory from './components/PaymentHistory';
import PaymentHistoryDetails from './components/PaymentHistoryDetails';
import ProductDetails from './components/ProductDetails';
import ProductKardex from './components/ProductKardex';
import Products from './components/Products';
import ProfileDetails from './components/ProfileDetails';
import SellerStats from './components/SellerStats';
import Sidebar from './components/Sidebar';
import TicketDetails from './components/TicketDetails';
import Tickets from './components/Tickets';
import WalletHistory from './components/WalletHistory';
import WalletHistoryDetails from './components/WalletHistoryDetails';
import WalletsList from './components/WalletsList';
import WalletDetails from './components/WalletDetails';
import LogsList from './components/LogsList';
import LogDetails from './components/LogDetails';
import ChecksList from './components/ChecksList';
import CheckDetails from './components/CheckDetails';
import RemindersList from './components/RemindersList';
import ReminderDetails from './components/ReminderDetails';
import ReceivingDetails from './components/ReceivingDetails';
import ReceivingsList from './components/ReceivingsList';
import UpdateProductPrices from './components/UpdateProductPrices';
import WarehouseDetails from './components/WarehouseDetails';
import WarehouseList from './components/WarehouseList';
import CapillarySalesLines from './components/CapillarySalesLines';
import CapillarySalesLineDetails from './components/CapillarySalesLineDetails';
import UserSidebar from './components/UserSidebar';
import UserProfile from './components/user/UserProfile';
import UserBusiness from './components/user/UserBusiness';
import UserWallet from './components/user/UserWallet';
import MyRequests from './components/user/MyRequests';
import MyRequestDetails from './components/user/MyRequestDetails';
import UserTickets from './components/user/UserTickets';
import UserTicketDetails from './components/user/UserTicketDetails';
import WalletTopupCallback from './components/user/WalletTopupCallback';
import UserProducts from './components/user/UserProducts';
import UserCart from './components/user/UserCart';
import UserFavorites from './components/user/UserFavorites';

function AdminPanel({ onLogout }: { onLogout: () => void }) {
	return (
		<div className='flex h-screen overflow-hidden font-vazir'>
			<Sidebar onLogout={onLogout} />
			<main className='flex-1 overflow-y-auto p-6 bg-gray-100'>
				<Routes>
					{/* Default redirect to orders */}
					<Route path='' element={<Navigate to='/manage/orders' replace />} />
					<Route path='/' element={<Navigate to='/manage/orders' replace />} />

					{/* Orders */}
					<Route path='orders' element={<Orders />} />
					<Route path='orders/:id' element={<OrderDetails />} />

					{/* Order History */}
					<Route path='order-history' element={<OrderHistory />} />
					<Route path='order-history/:id' element={<OrderHistoryDetails />} />

					{/* Payments */}
					<Route path='payments/:id' element={<PaymentDetails />} />

					{/* Payment History */}
					<Route path='payment-history' element={<PaymentHistory />} />
					<Route path='payment-history/:id' element={<PaymentHistoryDetails />} />

					{/* Invoices */}
					<Route path='invoices' element={<Invoices />} />
					<Route path='invoices/:id' element={<InvoiceDetails />} />

					{/* Invoice History */}
					<Route path='invoice-history' element={<InvoiceHistory />} />
					<Route path='invoice-history/:id' element={<InvoiceHistoryDetails />} />

					{/* Cargo History */}
					<Route path='cargo-history' element={<CargoHistory />} />

					{/* Customers - Specific routes must come before :id route */}
					<Route path='customers/by-debt' element={<CustomersByDebt />} />
					<Route path='customers/report' element={<CustomersReport />} />
					<Route path='customers/:id' element={<CustomerDetails />} />
					<Route path='customers' element={<Customers />} />

					{/* Customer Requests */}
					<Route path='customer-requests' element={<CustomerRequests />} />
					<Route path='customer-requests/:id' element={<CustomerRequestDetails />} />

					{/* Categories */}
					<Route path='categories' element={<Categories />} />
					<Route path='categories/:id' element={<CategoryDetails />} />

					{/* Products */}
					<Route path='products' element={<Products />} />
					<Route path='products/:id' element={<ProductDetails />} />

					{/* Warehouses */}
					<Route path='warehouses' element={<WarehouseList />} />
					<Route path='warehouses/:id' element={<WarehouseDetails />} />
					<Route path='warehouses/:id/product-kardex' element={<ProductKardex />} />
					<Route path='warehouses/:id/receivings' element={<ReceivingsList />} />
					<Route
						path='warehouses/:id/receivings/:receivingId'
						element={<ReceivingDetails />}
					/>
					<Route path='warehouses/:id/update-prices' element={<UpdateProductPrices />} />

					{/* Capillary Sales Lines */}
					<Route path='capillary-sales-lines' element={<CapillarySalesLines />} />
					<Route
						path='capillary-sales-lines/:id'
						element={<CapillarySalesLineDetails />}
					/>

					{/* Stats */}
					<Route path='stats' element={<Navigate to='/manage/stats/customers' replace />} />
					<Route path='stats/customers' element={<CustomerStats />} />
					<Route path='stats/orders' element={<OrderStats />} />
					<Route path='stats/sellers' element={<SellerStats />} />

					{/* Tickets */}
					<Route path='tickets' element={<Tickets />} />
					<Route path='tickets/:id' element={<TicketDetails />} />

					{/* Wallets */}
					<Route path='wallets' element={<WalletsList />} />
					<Route path='wallets/:id' element={<WalletDetails />} />

					{/* Wallet History */}
					<Route path='wallet-history' element={<WalletHistory />} />
					<Route path='wallet-history/:id' element={<WalletHistoryDetails />} />

					{/* Profiles */}
					<Route path='profiles' element={<Navigate to='/manage/profiles/employees' replace />} />
					<Route path='profiles/employees' element={<EmployeeProfiles />} />
					<Route path='profiles/others' element={<NonEmployeeProfiles />} />
					<Route path='profiles/:id' element={<ProfileDetails />} />

					{/* Logs */}
					<Route path='logs' element={<LogsList />} />
					<Route path='logs/:id' element={<LogDetails />} />

					{/* Checks */}
					<Route path='checks' element={<ChecksList />} />
					<Route path='checks/:id' element={<CheckDetails />} />

					{/* Reminders */}
					<Route path='reminders' element={<RemindersList />} />
					<Route path='reminders/:id' element={<ReminderDetails />} />

					{/* Fallback */}
					<Route path='*' element={<Navigate to='/manage/orders' replace />} />
				</Routes>
			</main>
		</div>
	);
}

function UserPanel({ onLogout }: { onLogout: () => void }) {
	return (
		<div className='flex h-screen overflow-hidden font-vazir'>
			<UserSidebar onLogout={onLogout} />
			<main className='flex-1 overflow-y-auto p-6 bg-gray-100'>
				<Routes>
					{/* Default redirect to profile */}
					<Route path='' element={<Navigate to='/user/profile' replace />} />
					<Route path='profile' element={<UserProfile />} />
					<Route path='business' element={<UserBusiness />} />
					<Route path='wallet' element={<UserWallet />} />
					<Route path='wallet-topup/callback' element={<WalletTopupCallback />} />
					<Route path='requests' element={<MyRequests />} />
					<Route path='requests/:id' element={<MyRequestDetails />} />
					{/* Tickets */}
					<Route path='tickets' element={<UserTickets />} />
					<Route path='tickets/:id' element={<UserTicketDetails />} />
					{/* Products */}
					<Route path='products' element={<UserProducts />} />
					{/* Favorites */}
					<Route path='favorites' element={<UserFavorites />} />
					{/* Cart */}
					<Route path='cart' element={<UserCart />} />
					{/* Fallback */}
					<Route path='*' element={<Navigate to='/user/profile' replace />} />
				</Routes>
			</main>
		</div>
	);
}

function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(
		!!localStorage.getItem('access_token'),
	);
	const [panelType, setPanelType] = useState<'admin' | 'customer' | null>(
		localStorage.getItem('panel_type') as 'admin' | 'customer' | null,
	);

	useEffect(() => {
		const token = localStorage.getItem('access_token');
		setIsLoggedIn(!!token);
		const storedPanelType = localStorage.getItem('panel_type');
		if (storedPanelType) {
			setPanelType(storedPanelType as 'admin' | 'customer');
		}
	}, []);

	const handleLoginSuccess = () => {
		setIsLoggedIn(true);
		const storedPanelType = localStorage.getItem('panel_type');
		if (storedPanelType) {
			setPanelType(storedPanelType as 'admin' | 'customer');
		}
	};

	const handleLogout = () => {
		localStorage.removeItem('access_token');
		localStorage.removeItem('refresh_token');
		localStorage.removeItem('panel_type');
		setIsLoggedIn(false);
		setPanelType(null);
	};

	return (
		<Router>
			<Routes>
				{/* Login Route */}
				{!isLoggedIn ? (
					<Route path='*' element={<Login onLoginSuccess={handleLoginSuccess} />} />
				) : (
					<>
						{/* Default redirect based on panel type */}
						<Route
							path='/'
							element={
								<Navigate
									to={panelType === 'admin' ? '/manage/orders' : '/user/profile'}
									replace
								/>
							}
						/>
						{/* Admin Panel Routes */}
						<Route
							path='/manage/*'
							element={<AdminPanel onLogout={handleLogout} />}
						/>
						{/* User Panel Routes */}
						<Route path='/user/*' element={<UserPanel onLogout={handleLogout} />} />
						{/* Fallback - redirect based on panel type */}
						<Route
							path='*'
							element={
								<Navigate
									to={panelType === 'admin' ? '/manage/orders' : '/user/profile'}
									replace
								/>
							}
						/>
					</>
				)}
			</Routes>
		</Router>
	);
}

export default App;
