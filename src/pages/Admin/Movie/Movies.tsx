import React, { useState, useCallback } from 'react';
import { IonButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonPage, IonToast, useIonViewWillEnter } from '@ionic/react';
import { addCircleOutline, createOutline, searchOutline, trashOutline } from 'ionicons/icons';
import Header from '../../../components/Header';
import axios from 'axios';

interface Movie {
    _id: string;
    title: string;
    description: string;
    genre: string;
    director: string;
    releaseDate: string;
    duration: number;
    image: string;
    rating: number;
}

const Movies: React.FC = () => {
    const [movies, setMovies] = useState<Movie[]>([]);

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useIonViewWillEnter(() => {
        fetchMovies();
    });

    const fetchMovies = useCallback(() => {
        axios.get('http://192.168.0.12:3000/api/movies')
            .then((response) => {
                if (response.status === 200) {
                    setMovies(response.data);
                    setErrorMessage('');
                } else if (response.status === 404) {
                    setMovies([]);
                    setErrorMessage(response.data);
                }
            })
            .catch((err) => {
                setErrorMessage(err.response?.data);
                console.log(err.response?.data || err.message);
            });
    }, []);

    function deleteMovie(movieId: string) {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.delete(`http://192.168.0.12:3000/api/movies/${movieId}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        setSuccessMessage("Movie successfully removed.");
                        fetchMovies();
                    }
                })
                .catch((err) => {
                    setErrorMessage(err.response?.data);
                    console.log(err.response?.data || err.message);
                });
        }
    }

    return (
        <IonPage>
            <IonHeader>
                <Header title='Cinemate' />
            </IonHeader>
            <IonContent className='ion-padding'>
                <div className='ion-text-right'>
                    <IonButton routerLink='/admin/movies/add' fill='solid' color={'success'}>Add <IonIcon icon={addCircleOutline} /></IonButton>
                </div>
                {movies.map(movie => (
                    <IonCard className='ion-padding' key={movie._id}>
                        <IonCardHeader>
                            <IonCardTitle>{movie.title}</IonCardTitle>
                            <IonCardSubtitle>{movie.director}, {movie.genre}, {Math.floor(movie.duration / 60)}h {movie.duration % 60}min</IonCardSubtitle>
                        </IonCardHeader>

                        <IonButton routerLink={`/admin/movies/${movie._id}`} fill='solid' color={'primary'}>View <IonIcon icon={searchOutline} /></IonButton>
                        <IonButton routerLink={`/admin/movies/update/${movie._id}`} fill='solid' color={'secondary'}>Edit <IonIcon icon={createOutline} /></IonButton>
                        <IonButton onClick={() => deleteMovie(movie._id)} fill='solid' color={'danger'}>Remove <IonIcon icon={trashOutline} /></IonButton>
                    </IonCard>
                ))}
                <IonToast isOpen={successMessage !== ''} message={successMessage} duration={3000} color={'success'} onDidDismiss={() => setSuccessMessage('')} style={{
                    position: 'fixed',
                    top: '10px',
                    right: '10px',
                    width: 'auto',
                    maxWidth: '300px',
                    zIndex: 9999
                }} />
                <IonToast isOpen={errorMessage !== ''} message={errorMessage} duration={3000} color={'danger'} onDidDismiss={() => setErrorMessage('')} style={{
                    position: 'fixed',
                    top: '10px',
                    right: '10px',
                    width: 'auto',
                    maxWidth: '300px',
                    zIndex: 9999
                }} />
            </IonContent>
        </IonPage>
    );
};

export default Movies;
