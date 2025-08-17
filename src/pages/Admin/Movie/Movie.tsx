import React, { useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router';
import { IonAlert, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonImg, IonLabel, IonPage, IonRow, IonSegment, IonSegmentButton, IonToast, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import { addCircleOutline, bulbOutline, calendarOutline, cashOutline, createOutline, star, ticketOutline, trashOutline } from 'ionicons/icons';
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
    movieId: string;
    hallId: string;
    numberOfAvailableSeats: number;
    basePriceEUR: number;
    basePriceUSD: number;
    basePriceCHF: number;
    priceEUR: number;
    priceUSD: number;
    priceCHF: number;
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

    const [currency, setCurrency] = useState<'EUR' | 'USD' | 'CHF'>('EUR');

    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [selectedScreeningId, setSelectedScreeningId] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [toast, setToast] = useState<{ message: string; color: 'success' | 'danger' }>({ message: '', color: 'success' });
    const [alertError, setAlertError] = useState<string>('');
    const [alertKey, setAlertKey] = useState(0);

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

    async function addDiscount(screeningId: string, discountAmount: number) {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.put(`/api/screenings/${screeningId}/discount`,
                { discount: discountAmount },
                {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'application/json'
                    }
                }
            )
                .then(() => {
                    setToast({ message: "Discount applied successfully.", color: "success" });
                    fetchScreeningsOfMovie(page);
                })
                .catch(err => {
                    setToast({ message: err.response.data.message, color: "danger" });
                    console.error(err.response.data.message || err.message);
                });
        }
    }

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
                        <IonSegment value={currency} onIonChange={(e) => setCurrency(e.detail.value as any)}>
                            <IonSegmentButton value="EUR">
                                <IonLabel>EUR (€)</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value="USD">
                                <IonLabel>USD ($)</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value="CHF">
                                <IonLabel>CHF (Fr)</IonLabel>
                            </IonSegmentButton>
                        </IonSegment>
                        <IonAlert key={alertKey} isOpen={showDiscountModal} onDidDismiss={() => {
                            setShowDiscountModal(false);
                            setAlertError('');
                        }}
                            header="Add Discount"
                            message={alertError}
                            inputs={[
                                {
                                    name: 'discount',
                                    type: 'number',
                                    min: 0,
                                    max: 100,
                                    placeholder: 'The discount amount (0-100%)'
                                }
                            ]}
                            buttons={[
                                {
                                    text: 'Cancel',
                                    role: 'cancel',
                                    handler: () => setAlertError('')
                                },
                                {
                                    text: 'Save',
                                    handler: async (data) => {
                                        const value = parseFloat(data.discount);

                                        if (isNaN(value) || value < 0 || value > 100) {
                                            setAlertError('Please enter a discount between 0 and 100.');
                                            return false;
                                        }

                                        await addDiscount(selectedScreeningId!, value);
                                        setShowDiscountModal(false);
                                        setAlertError('');
                                        setAlertKey(alertKey + 1);
                                        return true;
                                    }
                                }
                            ]}
                        />
                        <IonCardContent className='ion-padding'>
                            {screenings.map(screening => (
                                <IonCard className='ion-padding' key={screening._id} color={'light'}>
                                    <IonCardHeader>
                                        <IonCardTitle>{screening.cinemaName}, {screening.hallName}</IonCardTitle>
                                        <IonCardSubtitle><IonIcon icon={calendarOutline} /> {screening.time} - {screening.endTime}, {screening.date}</IonCardSubtitle>
                                        <IonCardSubtitle><IonIcon icon={ticketOutline} /> Number of available seats: {screening.numberOfAvailableSeats}</IonCardSubtitle>
                                        <IonCardSubtitle><IonIcon icon={cashOutline} /> Price: {
                                            (() => {
                                                const renderPrice = (basePrice: number, discountedPrice: number, suffix: string) => {
                                                    if (basePrice !== discountedPrice) {
                                                        return (
                                                            <>
                                                                <s>{basePrice.toFixed(2)} {suffix}</s> {discountedPrice.toFixed(2)} {suffix}
                                                            </>
                                                        );
                                                    }
                                                    return `${basePrice.toFixed(2)} ${suffix}`;
                                                };

                                                switch (currency) {
                                                    case 'EUR':
                                                        return renderPrice(screening.basePriceEUR, screening.priceEUR, 'EUR');
                                                    case 'USD':
                                                        return renderPrice(screening.basePriceUSD, screening.priceUSD, 'USD');
                                                    case 'CHF':
                                                        return renderPrice(screening.basePriceCHF, screening.priceCHF, 'CHF');
                                                    default:
                                                        return renderPrice(screening.basePriceEUR, screening.priceEUR, 'EUR');
                                                }
                                            })()
                                        }
                                        </IonCardSubtitle>
                                    </IonCardHeader>
                                    {isFutureScreening(screening.date) && (
                                        <>
                                            <IonButton onClick={() => { setSelectedScreeningId(screening._id); setShowDiscountModal(true); }} fill='solid' color={'success'}>Add Discount <IonIcon icon={bulbOutline} /></IonButton>
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