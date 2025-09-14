import React, { useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router';
import { useTranslation } from "react-i18next";
import { IonAlert, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonLabel, IonPage, IonSegment, IonSegmentButton, IonToast, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import { addCircleOutline, bulbOutline, calendarOutline, cashOutline, createOutline, ticketOutline, trashOutline } from 'ionicons/icons';
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
    movieId: string;
    movieTitle?: string;
    hallId: string;
    numberOfAvailableSeats: number;
    basePriceEUR: number;
    basePriceUSD: number;
    basePriceCHF: number;
    priceEUR: number;
    priceUSD: number;
    priceCHF: number;
}

const Hall: React.FC = () => {
    const { hallId } = useParams<{ hallId: string }>();
    const [hall, setHall] = useState<Omit<Hall, '_id'>>({
        name: '',
        numberOfSeats: NaN,
        cinemaId: ''
    })

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
    const { t } = useTranslation();

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

            axios.get(`/api/halls/${hallId}`)
                .then((response) => {
                    if (response.status === 200) {
                        const { name, numberOfSeats, cinemaId } = response.data;
                        setHall({ name, numberOfSeats, cinemaId });
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
                    fetchScreeningsForHall(page);
                })
                .catch(err => {
                    setToast({ message: err.response.data.message, color: "danger" });
                    console.error(err.response.data.message || err.message);
                });
        }
    }

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
                        setToast({ message: "Screening successfully removed.", color: 'success' });
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
                    setToast({ message: err.response.data.message, color: 'danger' });
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
                            <IonCardTitle>{t('screening.screeningsForHall', { hall: hall.name })}</IonCardTitle>
                            <IonButtons slot="end">
                                <IonButton routerLink={`/admin/screenings/add/hall/${hallId}`} fill='solid' color={'success'}>{t('buttons.add')} <IonIcon icon={addCircleOutline} /></IonButton>
                            </IonButtons>
                        </IonToolbar>
                        <IonCardContent>
                            <p className='ion-padding ion-text-center'>{t('screening.noScreeningsForHall')}</p>
                        </IonCardContent>
                        <div className="ion-text-center">
                            <IonButton disabled={page <= 1} onClick={() => changePage(page - 1)}>{t('pagination.previous')}</IonButton>
                            <span style={{ margin: '0 10px' }}>{t('pagination.info', { page, totalPages })}</span>
                            <IonButton disabled={page >= totalPages} onClick={() => changePage(page + 1)}>{t('pagination.next')}</IonButton>
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
                    <IonCard className='ion-padding'>
                        <IonToolbar>
                            <IonCardTitle>{t('screening.screeningsForHall', { hall: hall.name })}</IonCardTitle>
                            <IonButtons slot="end">
                                <IonButton routerLink={`/admin/screenings/add/hall/${hallId}`} fill='solid' color={'success'}>{t('buttons.add')} <IonIcon icon={addCircleOutline} /></IonButton>
                            </IonButtons>
                        </IonToolbar>
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
                        <IonAlert key={alertKey} isOpen={showDiscountModal} onDidDismiss={() => { setShowDiscountModal(false); setAlertError(''); }}
                            header={t('discount.header')}
                            message={alertError}
                            inputs={[
                                {
                                    name: 'discount',
                                    type: 'number',
                                    min: 0,
                                    max: 100,
                                    placeholder: t('discount.placeholder')
                                }
                            ]}
                            buttons={[
                                {
                                    text: t('buttons.cancel'),
                                    role: 'cancel',
                                    handler: () => setAlertError('')
                                },
                                {
                                    text: t('buttons.save'),
                                    handler: async (data) => {
                                        const value = parseFloat(data.discount);

                                        if (isNaN(value) || value < 0 || value > 100) {
                                            setAlertError(t('discount.error'));
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
                        <IonCardContent>
                            {screenings.map(screening => (
                                <IonCard className='ion-padding' key={screening._id} color={'light'}>
                                    <IonCardHeader>
                                        <IonCardTitle>{screening.movieTitle}</IonCardTitle>
                                        <IonCardSubtitle><IonIcon icon={calendarOutline} /> {screening.time} - {screening.endTime}, {screening.date}</IonCardSubtitle>
                                        <IonCardSubtitle><IonIcon icon={ticketOutline} /> {t('screening.numberOfAvailableSeats')}: {screening.numberOfAvailableSeats}</IonCardSubtitle>
                                        <IonCardSubtitle><IonIcon icon={cashOutline} /> {t('screening.price')}: {
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
                                            <IonButton onClick={() => { setSelectedScreeningId(screening._id); setShowDiscountModal(true); }} fill='solid' color={'success'}>{t('buttons.addDiscount')} <IonIcon icon={bulbOutline} /></IonButton>
                                            <IonButton routerLink={`/admin/screenings/update/${screening._id}/hall/${hallId}`} fill='solid' color={'secondary'}>{t('buttons.edit')} <IonIcon icon={createOutline} /></IonButton>
                                            <IonButton onClick={() => deleteScreening(screening._id)} fill='solid' color={'danger'}>{t('buttons.remove')} <IonIcon icon={trashOutline} /></IonButton>
                                        </>
                                    )}
                                </IonCard>
                            ))}
                        </IonCardContent>
                        <div className="ion-text-center">
                            <IonButton disabled={page <= 1} onClick={() => changePage(page - 1)}>{t('pagination.previous')}</IonButton>
                            <span style={{ margin: '0 10px' }}>{t('pagination.info', { page, totalPages })}</span>
                            <IonButton disabled={page >= totalPages} onClick={() => changePage(page + 1)}>{t('pagination.next')}</IonButton>
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

export default Hall;