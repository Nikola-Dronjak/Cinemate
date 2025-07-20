import React, { useState, useEffect } from 'react';
import { IonButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonPage, IonToast, useIonViewWillEnter } from '@ionic/react';
import { addCircleOutline, createOutline, searchOutline, trashOutline } from 'ionicons/icons';
import Header from '../../../components/Header';
import axios from '../../../api/AxiosInstance';

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

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchMovies(page);
    }, [page]);

    useIonViewWillEnter(() => {
        fetchMovies(page);
    });

    const fetchMovies = (currentPage: number = page) => {
        axios.get(`/api/movies?page=${page}&limit=${limit}`)
            .then((response) => {
                if (response.status === 200) {
                    const cleanMovies: Movie[] = response.data.movies.map((movie: any) => ({
                        _id: movie._id,
                        title: movie.title,
                        description: movie.description,
                        genre: movie.genre,
                        director: movie.director,
                        releaseDate: movie.releaseDate,
                        duration: movie.duration,
                        image: movie.image,
                        rating: movie.rating
                    }));
                    setTotalPages(response.data.totalPages);
                    setMovies(cleanMovies);
                    setErrorMessage('');
                } else if (response.status === 404) {
                    setMovies([]);
                    setErrorMessage(response.data.message);
                }
            })
            .catch((err) => {
                setErrorMessage(err.response.data.message);
                console.error(err.response.data.message || err.message);
            });
    };

    function deleteMovie(movieId: string) {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.delete(`/api/movies/${movieId}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 204) {
                        setSuccessMessage("Movie successfully removed.");
                        if (movies.length === 1 && page > 1) {
                            setPage(prev => prev - 1);
                        } else {
                            fetchMovies(page);
                        }
                    }
                })
                .catch((err) => {
                    setErrorMessage(err.response.data.message);
                    console.error(err.response.data.message || err.message);
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
                <div className="ion-text-center">
                    <IonButton disabled={page <= 1} onClick={() => setPage(prev => Math.max(prev - 1, 1))}>Previous</IonButton>
                    <span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
                    <IonButton disabled={page >= totalPages} onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}>Next</IonButton>
                </div>
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
