import React from 'react';
import { Redirect, Route } from 'react-router';
import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { easelOutline, filmOutline } from 'ionicons/icons';
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

const Admin: React.FC = () => {

    return (
        <IonTabs>
            <IonRouterOutlet>
                <Route exact path={'/admin/cinemas'} component={Cinemas} />
                <Route exact path={'/admin/cinemas/:cinemaId'} component={Halls} />
                <Route exact path={'/admin/cinemas/add'} component={AddCinema} />
                <Route exact path={'/admin/cinemas/update/:cinemaId'} component={UpdateCinema} />

                <Route exact path={'/admin/halls/:hallId'} component={Hall} />
                <Route exact path={'/admin/halls/add/:cinemaId'} component={AddHall} />
                <Route exact path={'/admin/halls/update/:hallId'} component={UpdateHall} />

                <Route exact path={'/admin/movies'} component={Movies} />
                <Route exact path={'/admin/movies/:movieId'} component={Movie} />
                <Route exact path={'/admin/movies/add'} component={AddMovie} />
                <Route exact path={'/admin/movies/update/:movieId'} component={UpdateMovie} />

                <Route exact path={'/admin/screenings/add/hall/:hallId'} component={AddScreening} />
                <Route exact path={'/admin/screenings/add/movie/:movieId'} component={AddScreening} />
                <Route exact path={'/admin/screenings/update/:screeningId/hall/:hallId'} component={UpdateScreening} />
                <Route exact path={'/admin/screenings/update/:screeningId/movie/:movieId'} component={UpdateScreening} />

                <Route exact path={'/admin'}>
                    <Redirect to={'/admin/cinemas'} />
                </Route>
            </IonRouterOutlet>

            <IonTabBar slot={'bottom'}>
                <IonTabButton tab={'Cinemas'} href={'/admin/cinemas'}>
                    <IonIcon icon={easelOutline} />
                    <IonLabel>Cinemas</IonLabel>
                </IonTabButton>
                <IonTabButton tab={'Movies'} href={'/admin/movies'}>
                    <IonIcon icon={filmOutline} />
                    <IonLabel>Movies</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    );
};

export default Admin;