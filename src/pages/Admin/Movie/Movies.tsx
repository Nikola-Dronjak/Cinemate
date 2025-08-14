import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router';
import { IonButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonPage, IonToast, useIonViewWillEnter } from '@ionic/react';
import { addCircleOutline, createOutline, searchOutline, trashOutline } from 'ionicons/icons';
import queryString from 'query-string';
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

    const [toast, setToast] = useState<{ message: string; color: 'success' | 'danger' }>({ message: '', color: 'success' });

    const location = useLocation();
    const history = useHistory();

    useIonViewWillEnter(() => {
        const { page: queryPage } = queryString.parse(location.search);
        const parsedPage = Math.max(parseInt(queryPage as string) || 1, 1);
        setPage(parsedPage);
        fetchMovies(parsedPage);
    });

    useEffect(() => {
        if (location.pathname === '/admin/movies') {
            const { page: queryPage } = queryString.parse(location.search);
            const parsedPage = Math.max(parseInt(queryPage as string) || 1, 1);
            setPage(parsedPage);
            fetchMovies(parsedPage);
        }
    }, [location.pathname, location.search]);

    const fetchMovies = (currentPage: number = 1) => {
        axios.get(`/api/movies?page=${currentPage}&limit=${limit}&upcomingOnly=${false}`)
            .then((response) => {
                if (response.status === 200) {

                    if (!response.data.movies || response.data.movies.length === 0) {
                        setMovies([]);
                        setTotalPages(1);
                        return;
                    }

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
                }
            })
            .catch((err) => {
                if (err.response.status === 404) {
                    setTotalPages(1);
                    setMovies([]);
                } else {
                    setToast({ message: err.response.data.message, color: 'danger' });
                    console.error(err.response.data.message || err.message);
                }
            });
    };

    const changePage = (newPage: number) => {
        if (newPage !== page) {
            history.push(`/admin/movies?page=${newPage}`);
            setPage(newPage);
        }
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
                        setToast({ message: "Movie successfully removed.", color: 'success' });
                        const updatedMovies = movies.filter(movie => movie._id !== movieId);
                        const isLastItemOnPage = updatedMovies.length === 0;
                        const newPage = isLastItemOnPage && page > 1 ? page - 1 : page;

                        if (newPage !== page) {
                            history.push(`/admin/movies?page=${newPage}`);
                        } else {
                            setMovies(updatedMovies);
                            fetchMovies(page);
                        }
                    }
                })
                .catch((err) => {
                    setToast({ message: err.response.data.message, color: 'danger' });
                    console.error(err.response.data.message || err.message);
                });
        }
    }

    return (
        <IonPage>
            <IonHeader>
                <Header title='Cinemate' />
            </IonHeader>
            {movies.length === 0 ? (
                <IonContent className='ion-padding'>
                    <div className='ion-text-right'>
                        <IonButton routerLink='/admin/movies/add' fill='solid' color={'success'}>Add<IonIcon icon={addCircleOutline} /></IonButton>
                    </div >
                    <p className='ion-padding ion-text-center'>There are no movies in the database right now.</p>
                    <div className="ion-text-center">
                        <IonButton disabled={page <= 1} onClick={() => changePage(page - 1)}>Previous</IonButton>
                        <span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
                        <IonButton disabled={page >= totalPages} onClick={() => changePage(page + 1)}>Next</IonButton>
                    </div>
                    <IonToast isOpen={!!toast.message} message={toast.message} duration={3000} color={toast.color} onDidDismiss={() => setToast({ message: '', color: 'success' })} style={{
                        position: 'fixed',
                        top: '10px',
                        right: '10px',
                        width: 'auto',
                        maxWidth: '300px',
                        zIndex: 9999
                    }} />
                </IonContent >
            ) : (
                <IonContent className='ion-padding'>
                    <div className='ion-text-right'>
                        <IonButton routerLink='/admin/movies/add' fill='solid' color={'success'}>Add<IonIcon icon={addCircleOutline} /></IonButton>
                    </div >
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
                        <IonButton disabled={page <= 1} onClick={() => changePage(page - 1)}>Previous</IonButton>
                        <span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
                        <IonButton disabled={page >= totalPages} onClick={() => changePage(page + 1)}>Next</IonButton>
                    </div>
                    <IonToast isOpen={!!toast.message} message={toast.message} duration={3000} color={toast.color} onDidDismiss={() => setToast({ message: '', color: 'success' })} style={{
                        position: 'fixed',
                        top: '10px',
                        right: '10px',
                        width: 'auto',
                        maxWidth: '300px',
                        zIndex: 9999
                    }} />
                </IonContent >
            )}
        </IonPage >
    );
};

export default Movies;
