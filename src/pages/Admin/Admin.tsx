import React from 'react';
import { Redirect, Route } from 'react-router';
import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { easelOutline, filmOutline, peopleOutline } from 'ionicons/icons';
import useAuth from '../../Authentication/useAuth';
import { UserRoles } from '../../enums/UserRoles';

import Cinemas from './Cinema/Cinemas';
import AddCinema from './Cinema/AddCinema';
import UpdateCinema from './Cinema/UpdateCinema';
import Movies from './Movie/Movies';
import Movie from './Movie/Movie';
import AddMovie from './Movie/AddMovie';
import UpdateMovie from './Movie/UpdateMovie';
import Halls from './Hall/Halls';
import Hall from './Hall/Hall';
import AddHall from './Hall/AddHall';
import UpdateHall from './Hall/UpdateHall';
import AddScreening from './Screening/AddScreening';
import UpdateScreening from './Screening/UpdateScreening';
import Users from './User/Users';
import Home from '../User/Home';

type Tab = {
    path: string;
    label: string;
    icon: string;
};

type RoleConfig = {
    tabs: Tab[];
    routes: JSX.Element;
    defaultRedirect: string;
};

const Admin: React.FC = () => {
    const { role, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!role) return <Redirect to="/home" />;

    const roleConfig: Record<UserRoles, RoleConfig> = {
        [UserRoles.Admin]: {
            tabs: [
                { path: '/admin/cinemas', label: 'Cinemas', icon: easelOutline },
                { path: '/admin/movies', label: 'Movies', icon: filmOutline },
                { path: '/admin/users', label: 'Users', icon: peopleOutline },
            ],
            routes: (
                <>
                    <Route exact path="/admin/cinemas" component={Cinemas} />
                    <Route exact path="/admin/cinemas/:cinemaId" component={Halls} />
                    <Route exact path="/admin/cinemas/add" component={AddCinema} />
                    <Route exact path="/admin/cinemas/update/:cinemaId" component={UpdateCinema} />

                    <Route exact path="/admin/halls/:hallId" component={Hall} />
                    <Route exact path="/admin/halls/add/:cinemaId" component={AddHall} />
                    <Route exact path="/admin/halls/update/:hallId" component={UpdateHall} />

                    <Route exact path="/admin/movies" component={Movies} />
                    <Route exact path="/admin/movies/:movieId" component={Movie} />
                    <Route exact path="/admin/movies/add" component={AddMovie} />
                    <Route exact path="/admin/movies/update/:movieId" component={UpdateMovie} />

                    <Route exact path="/admin/screenings/add/hall/:hallId" component={AddScreening} />
                    <Route exact path="/admin/screenings/add/movie/:movieId" component={AddScreening} />
                    <Route exact path="/admin/screenings/update/:screeningId/hall/:hallId" component={UpdateScreening} />
                    <Route exact path="/admin/screenings/update/:screeningId/movie/:movieId" component={UpdateScreening} />

                    <Route exact path="/admin/users" component={Users} />
                </>
            ),
            defaultRedirect: '/admin/cinemas',
        },
        [UserRoles.Sales]: {
            tabs: [
                { path: '/admin/cinemas', label: 'Cinemas', icon: easelOutline },
                { path: '/admin/movies', label: 'Movies', icon: filmOutline },
            ],
            routes: (
                <>
                    <Route exact path="/admin/cinemas" component={Cinemas} />
                    <Route exact path="/admin/cinemas/:cinemaId" component={Halls} />

                    <Route exact path="/admin/halls/:hallId" component={Hall} />

                    <Route exact path="/admin/movies" component={Movies} />
                    <Route exact path="/admin/movies/:movieId" component={Movie} />
                    <Route exact path="/admin/movies/add" component={AddMovie} />
                    <Route exact path="/admin/movies/update/:movieId" component={UpdateMovie} />

                    <Route exact path="/admin/screenings/add/hall/:hallId" component={AddScreening} />
                    <Route exact path="/admin/screenings/add/movie/:movieId" component={AddScreening} />
                    <Route exact path="/admin/screenings/update/:screeningId/hall/:hallId" component={UpdateScreening} />
                    <Route exact path="/admin/screenings/update/:screeningId/movie/:movieId" component={UpdateScreening} />
                </>
            ),
            defaultRedirect: '/admin/cinemas',
        },
        [UserRoles.Customer]: {
            tabs: [],
            routes: (
                <>
                    <Route exact path="/home" component={Home} />
                </>
            ),
            defaultRedirect: '/home'
        }
    };

    const config = roleConfig[role];

    return (
        <IonTabs>
            <IonRouterOutlet>
                {config.routes}
                <Route exact path="/admin">
                    <Redirect to={config.defaultRedirect} />
                </Route>
            </IonRouterOutlet>

            <IonTabBar slot="bottom">
                {config.tabs.map(tab => (
                    <IonTabButton key={tab.path} tab={tab.label} href={tab.path}>
                        <IonIcon icon={tab.icon} />
                        <IonLabel>{tab.label}</IonLabel>
                    </IonTabButton>
                ))}
            </IonTabBar>
        </IonTabs>
    );
};

export default Admin;