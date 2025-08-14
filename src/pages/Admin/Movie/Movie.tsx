import React, { useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonImg, IonPage, IonRow, IonToast, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import { addCircleOutline, calendarOutline, createOutline, star, ticketOutline, trashOutline } from 'ionicons/icons';
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

interface Screening {
    _id: string;
    date: string;
    time: string;
    endTime: string;
    numberOfAvailableSeats: number;
    movieId: string;
    hallId: string;
    hallName?: string;
    cinemaName?: string;
}

const Movie: React.FC = () => {
    const { movieId } = useParams<{ movieId: string }>();
    const [movie, setMovie] = useState<Omit<Movie, '_id'>>({
        title: '',
        description: '',
        genre: '',
        director: '',
        releaseDate: '',
        duration: NaN,
        image: '',
        rating: NaN
    });

    const [screenings, setScreenings] = useState<Screening[]>([]);

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
        fetchScreeningsOfMovie(parsedPage);
    });

    useEffect(() => {
        if (location.pathname === `/admin/movies/${movieId}`) {
            const { page: queryPage } = queryString.parse(location.search);
            const parsedPage = Math.max(parseInt(queryPage as string) || 1, 1);
            setPage(parsedPage);
            fetchScreeningsOfMovie(parsedPage);
        }
    }, [location.pathname, location.search]);

    const fetchScreeningsOfMovie = (currentPage: number = 1) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.get(`/api/movies/${movieId}/screenings?page=${currentPage}&limit=${limit}&upcomingOnly=${false}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then(async (response) => {
                    if (response.status === 200) {
                        const screeningsRaw = response.data.screeningsOfMovie;

                        if (!screeningsRaw || screeningsRaw.length === 0) {
                            setScreenings([]);
                            setTotalPages(1);
                            return;
                        }

                        const screeningsWithHallAndCinemaNames = await Promise.all(
                            screeningsRaw.map(async (screening: any) => {
                                let hallName = 'Unknown';
                                let cinemaName = 'Unknown';
                                try {
                                    const hall = await axios.get(`/api/halls/${screening.hallId}`);
                                    if (hall.status === 200) {
                                        hallName = hall.data.name;

                                        try {
                                            const cinema = await axios.get(`/api/cinemas/${hall.data.cinemaId}`);
                                            if (cinema.status === 200) {
                                                cinemaName = cinema.data.name;
                                            }
                                        } catch (err) {
                                            console.error(`Error fetching cinema ${hall.data.cinemaId}`, err);
                                        }
                                    }
                                } catch (err) {
                                    console.error(`Error fetching hall ${screening.hallId}`, err);
                                }
                                return {
                                    ...screening,
                                    hallName,
                                    cinemaName
                                };
                            })
                        );
                        setTotalPages(response.data.totalPages);
                        setScreenings(screeningsWithHallAndCinemaNames);
                    }
                })
                .catch((err) => {
                    if (err.response.status === 404) {
                        setTotalPages(1);
                        setScreenings([]);
                    } else {
                        setToast({ message: err.response.data.message, color: 'danger' });
                        console.error(err.response.data.message || err.message);
                    }
                });

            axios.get(`/api/movies/${movieId}`)
                .then((response) => {
                    if (response.status === 200) {
                        const { title, description, genre, director, releaseDate, duration, image, rating } = response.data;
                        setMovie({ title, description, genre, director, releaseDate, duration, image, rating });
                    }
                })
                .catch((err) => {
                    setToast({ message: err.response.data.message, color: 'danger' });
                    console.error(err.response.data.message || err.message);
                });
        }
    };

    const changePage = (newPage: number) => {
        if (newPage !== page) {
            history.push(`/admin/movies/${movieId}?page=${newPage}`);
            setPage(newPage);
        }
    };

    const isFutureScreening = (screeningDate: string) => {
        const today = new Date();
        const screeningDateTime = new Date(screeningDate);
        const diffTime = screeningDateTime.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 1;
    };

    function deleteScreening(screeningId: string) {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.delete(`/api/screenings/${screeningId}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 204) {
                        setToast({ message: "Screening successfully removed.", color: 'success' });
                        const updatedScreenings = screenings.filter(screening => screening._id !== screeningId);
                        const isLastItemOnPage = updatedScreenings.length === 0;
                        const newPage = isLastItemOnPage && page > 1 ? page - 1 : page;

                        if (newPage !== page) {
                            history.push(`/admin/movies/${movieId}?page=${newPage}`);
                        } else {
                            setScreenings(updatedScreenings);
                            fetchScreeningsOfMovie(page);
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
            {screenings.length === 0 ? (
                <IonContent className='ion-padding'>
                    <IonGrid fixed>
                        <IonRow className='ion-justify-content-center'>
                            <IonCol size='12' sizeMd='12' sizeLg='10' sizeXl='8'>
                                <IonCard>
                                    <IonCardContent>
                                        <IonGrid>
                                            <IonRow>
                                                <IonCol size='12' sizeMd='6'>
                                                    <IonImg src={`${import.meta.env.VITE_SERVER_ADDRESS}/images/${movie.image}`} alt={movie.title} />
                                                </IonCol>
                                                <IonCol size='12' sizeMd='6'>
                                                    <IonCardHeader>
                                                        <IonCardTitle>{movie.director}</IonCardTitle>
                                                        <IonCardSubtitle>{movie.genre}, {Math.floor(movie.duration / 60)}h {movie.duration % 60}min</IonCardSubtitle>
                                                        <IonCardSubtitle>Release date: {movie.releaseDate}</IonCardSubtitle>
                                                        <IonCardSubtitle>IMDb rating: {movie.rating} <IonIcon icon={star} /></IonCardSubtitle>
                                                    </IonCardHeader>
                                                    <IonCardContent>{movie.description}</IonCardContent>
                                                </IonCol>
                                            </IonRow>
                                        </IonGrid>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                    <IonCard>
                        <IonCardHeader>
                            <IonToolbar color={'none'}>
                                <IonCardTitle>Screenings for {movie.title}</IonCardTitle>
                                <IonButtons slot="end">
                                    <IonButton routerLink={`/admin/screenings/add/movie/${movieId}`} fill='solid' color={'success'}>Add <IonIcon icon={addCircleOutline} /></IonButton>
                                </IonButtons>
                            </IonToolbar>
                        </IonCardHeader>
                        <IonCardContent className='ion-padding'>
                            <p className='ion-padding ion-text-center'>There are no screenings for this movie right now.</p>
                        </IonCardContent>
                        <div className="ion-text-center">
                            <IonButton disabled={page <= 1} onClick={() => changePage(page - 1)}>Previous</IonButton>
                            <span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
                            <IonButton disabled={page >= totalPages} onClick={() => changePage(page + 1)}>Next</IonButton>
                        </div>
                    </IonCard>
                    <IonToast isOpen={!!toast.message} message={toast.message} duration={3000} color={toast.color} onDidDismiss={() => setToast({ message: '', color: 'success' })} style={{
                        position: 'fixed',
                        top: '10px',
                        right: '10px',
                        width: 'auto',
                        maxWidth: '300px',
                        zIndex: 9999
                    }} />
                </IonContent>
            ) : (
                <IonContent className='ion-padding'>
                    <IonGrid fixed>
                        <IonRow className='ion-justify-content-center'>
                            <IonCol size='12' sizeMd='12' sizeLg='10' sizeXl='8'>
                                <IonCard>
                                    <IonCardContent>
                                        <IonGrid>
                                            <IonRow>
                                                <IonCol size='12' sizeMd='6'>
                                                    <IonImg src={`${import.meta.env.VITE_SERVER_ADDRESS}/images/${movie.image}`} alt={movie.title} />
                                                </IonCol>
                                                <IonCol size='12' sizeMd='6'>
                                                    <IonCardHeader>
                                                        <IonCardTitle>{movie.director}</IonCardTitle>
                                                        <IonCardSubtitle>{movie.genre}, {Math.floor(movie.duration / 60)}h {movie.duration % 60}min</IonCardSubtitle>
                                                        <IonCardSubtitle>Release date: {movie.releaseDate}</IonCardSubtitle>
                                                        <IonCardSubtitle>IMDb rating: {movie.rating} <IonIcon icon={star} /></IonCardSubtitle>
                                                    </IonCardHeader>
                                                    <IonCardContent>{movie.description}</IonCardContent>
                                                </IonCol>
                                            </IonRow>
                                        </IonGrid>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                    <IonCard>
                        <IonCardHeader>
                            <IonToolbar color={'none'}>
                                <IonCardTitle>Screenings for {movie.title}</IonCardTitle>
                                <IonButtons slot="end">
                                    <IonButton routerLink={`/admin/screenings/add/movie/${movieId}`} fill='solid' color={'success'}>Add <IonIcon icon={addCircleOutline} /></IonButton>
                                </IonButtons>
                            </IonToolbar>
                        </IonCardHeader>
                        <IonCardContent className='ion-padding'>
                            {screenings.map(screening => (
                                <IonCard className='ion-padding' key={screening._id} color={'light'}>
                                    <IonCardHeader>
                                        <IonCardTitle>{screening.cinemaName}, {screening.hallName}</IonCardTitle>
                                        <IonCardSubtitle><IonIcon icon={calendarOutline} /> {screening.time} - {screening.endTime}, {screening.date}</IonCardSubtitle>
                                        <IonCardSubtitle><IonIcon icon={ticketOutline} /> Number of available seats: {screening.numberOfAvailableSeats}</IonCardSubtitle>
                                    </IonCardHeader>

                                    {isFutureScreening(screening.date) && (
                                        <>
                                            <IonButton routerLink={`/admin/screenings/update/${screening._id}/movie/${movieId}`} fill='solid' color={'secondary'}>Edit <IonIcon icon={createOutline} /></IonButton>
                                            <IonButton onClick={() => deleteScreening(screening._id)} fill='solid' color={'danger'}>Remove <IonIcon icon={trashOutline} /></IonButton>
                                        </>
                                    )}
                                </IonCard>
                            ))}
                        </IonCardContent>
                        <div className="ion-text-center">
                            <IonButton disabled={page <= 1} onClick={() => changePage(page - 1)}>Previous</IonButton>
                            <span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
                            <IonButton disabled={page >= totalPages} onClick={() => changePage(page + 1)}>Next</IonButton>
                        </div>
                    </IonCard>
                    <IonToast isOpen={!!toast.message} message={toast.message} duration={3000} color={toast.color} onDidDismiss={() => setToast({ message: '', color: 'success' })} style={{
                        position: 'fixed',
                        top: '10px',
                        right: '10px',
                        width: 'auto',
                        maxWidth: '300px',
                        zIndex: 9999
                    }} />
                </IonContent>
            )}
        </IonPage>
    );
}

export default Movie;