import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/User/Home';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import Admin from './pages/Admin/Admin';
import MovieDetails from './pages/User/MovieDetails';
import Account from './pages/User/Account';
import Reservations from './pages/User/Reservations';
import withAuth from './Authentication/withAuth';
import withAdmin from './Authentication/withAdmin';

setupIonicReact();

const App: React.FC = () => (
	<IonApp>
		<IonReactRouter>
			<IonRouterOutlet>
				<Route exact path={'/register'} component={Register} />
				<Route exact path={'/login'} component={Login} />
				<Route exact path={'/home'} component={Home} />
				<Route exact path={'/home/details/:movieId'} component={MovieDetails} />
				<Route exact path={'/account'} component={withAuth(Account)} />
				<Route exact path={'/reservations'} component={withAuth(Reservations)} />
				<Route path={'/admin'} component={withAdmin(Admin)} />

				<Route exact path={'/'}>
					<Redirect to={'/home'} />
				</Route>
			</IonRouterOutlet>
		</IonReactRouter>
	</IonApp>
);

export default App;
