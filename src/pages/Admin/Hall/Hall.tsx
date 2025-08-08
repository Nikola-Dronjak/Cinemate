import React, { useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonPage, IonToast, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import { addCircleOutline, calendarOutline, createOutline, ticketOutline, trashOutline } from 'ionicons/icons';
import queryString from 'query-string';
import Header from '../../../components/Header';
import axios from '../../../api/AxiosInstance';

interface Hall {
    _id: string,
    name: string,
    numberOfSeats: number,
    cinemaId: string
}

interface Screening {
    _id: string;
    date: string;
    time: string;
    endTime: string;
    numberOfAvailableSeats: number;
    movieId: string;
    movieTitle?: string;
    hallId: string;
}

const Hall: React.FC = () => {
    const { hallId } = useParams<{ hallId: string }>();
    const [hall, setHall] = useState<Omit<Hall, '_id'>>({
        name: '',
        numberOfSeats: NaN,
        cinemaId: ''
    })

    const [screenings, setScreenings] = useState<Screening[]>([]);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const location = useLocation();
    const history = useHistory();

    useIonViewWillEnter(() => {
        const { page: queryPage } = queryString.parse(location.search);
        const parsedPage = Math.max(parseInt(queryPage as string) || 1, 1);
        setPage(parsedPage);
        fetchScreeningsForHall(parsedPage);
    });

    useEffect(() => {
        if (location.pathname === `/admin/halls/${hallId}`) {
            const { page: queryPage } = queryString.parse(location.search);
            const parsedPage = Math.max(parseInt(queryPage as string) || 1, 1);
            setPage(parsedPage);
            fetchScreeningsForHall(parsedPage);
        }
    }, [location.pathname, location.search]);

    const fetchScreeningsForHall = (currentPage: number = 1) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.get(`/api/halls/${hallId}/screenings?page=${currentPage}&limit=${limit}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then(async (response) => {
                    if (response.status === 200) {
                        const screeningsRaw = response.data.screeningsForHall;

                        if (!screeningsRaw || screeningsRaw.length === 0) {
                            setScreenings([]);
                            setTotalPages(1);
                            return;
                        }

                        const screeningsWithTitles = await Promise.all(
                            screeningsRaw.map(async (screening: any) => {
                                try {
                                    const movie = await axios.get(`/api/movies/${screening.movieId}`);
                                    const movieTitle = movie.status === 200 ? movie.data.title : 'Unknown';
                                    return {
                                        ...screening,
                                        movieTitle,
                                    };
                                } catch (err) {
                                    console.error(`Error fetching movie ${screening.movieId}`, err);
                                    return {
                                        ...screening,
                                        movieTitle: 'Unknown',
                                    };
                                }
                            })
                        );
                        setTotalPages(response.data.totalPages);
                        setScreenings(screeningsWithTitles);
                    } else if (response.status === 404) {
                        setTotalPages(1);
                        setScreenings([]);
                        setErrorMessage(response.data.message);
                    }
                })
                .catch((err) => {
                    setErrorMessage(err.response.data.message);
                    console.error(err.response.data.message || err.message);
                });

            axios.get(`/api/halls/${hallId}`)
                .then((response) => {
                    if (response.status === 200) {
                        const { name, numberOfSeats, cinemaId } = response.data;
                        setHall({ name, numberOfSeats, cinemaId });
                    }
                })
                .catch((err) => {
                    setErrorMessage(err.response.data.message);
                    console.error(err.response.data.message || err.message);
                });
        }
    };

    const changePage = (newPage: number) => {
        if (newPage !== page) {
            history.push(`/admin/halls/${hallId}?page=${newPage}`);
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
                        setSuccessMessage("Screening successfully removed.");
                        const updatedScreenings = screenings.filter(screening => screening._id !== screeningId);
                        const isLastItemOnPage = updatedScreenings.length === 0;
                        const newPage = isLastItemOnPage && page > 1 ? page - 1 : page;

                        if (newPage !== page) {
                            history.push(`/admin/halls/${hallId}?page=${newPage}`);
                        } else {
                            setScreenings(updatedScreenings);
                            fetchScreeningsForHall(page);
                        }
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
            {screenings.length === 0 ? (
                <IonContent className='ion-padding'>
                    <IonCard className='ion-padding'>
                        <IonToolbar>
                            <IonCardTitle>Screenings for {hall.name}</IonCardTitle>
                            <IonButtons slot="end">
                                <IonButton routerLink={`/admin/screenings/add/hall/${hallId}`} fill='solid' color={'success'}>Add <IonIcon icon={addCircleOutline} /></IonButton>
                            </IonButtons>
                        </IonToolbar>
                        <IonCardContent>
                            <p className='ion-padding ion-text-center'>{errorMessage}</p>
                        </IonCardContent>
                        <div className="ion-text-center">
                            <IonButton disabled={page <= 1} onClick={() => changePage(page - 1)}>Previous</IonButton>
                            <span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
                            <IonButton disabled={page >= totalPages} onClick={() => changePage(page + 1)}>Next</IonButton>
                        </div>
                    </IonCard>
                </IonContent>
            ) : (
                <IonContent className='ion-padding'>
                    <IonCard className='ion-padding'>
                        <IonToolbar>
                            <IonCardTitle>Screenings for {hall.name}</IonCardTitle>
                            <IonButtons slot="end">
                                <IonButton routerLink={`/admin/screenings/add/hall/${hallId}`} fill='solid' color={'success'}>Add <IonIcon icon={addCircleOutline} /></IonButton>
                            </IonButtons>
                        </IonToolbar>
                        <IonCardContent>
                            {screenings.map(screening => (
                                <IonCard className='ion-padding' key={screening._id} color={'light'}>
                                    <IonCardHeader>
                                        <IonCardTitle>{screening.movieTitle}</IonCardTitle>
                                        <IonCardSubtitle><IonIcon icon={calendarOutline} /> {screening.time} - {screening.endTime}, {screening.date}</IonCardSubtitle>
                                        <IonCardSubtitle><IonIcon icon={ticketOutline} /> Number of available seats: {screening.numberOfAvailableSeats}</IonCardSubtitle>
                                    </IonCardHeader>

                                    {isFutureScreening(screening.date) && (
                                        <>
                                            <IonButton routerLink={`/admin/screenings/update/${screening._id}/hall/${hallId}`} fill='solid' color={'secondary'}>Edit <IonIcon icon={createOutline} /></IonButton>
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
            )}
        </IonPage>
    );
}

export default Hall;