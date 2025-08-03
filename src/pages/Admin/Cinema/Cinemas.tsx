import React, { useState, useEffect } from 'react';
import { IonButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonPage, IonToast, useIonViewWillEnter } from '@ionic/react';
import { addCircleOutline, createOutline, pinOutline, searchOutline, trashOutline } from 'ionicons/icons';
import Header from '../../../components/Header';
import axios from '../../../api/AxiosInstance';

interface Cinema {
    _id: string;
    name: string;
    address: string;
    city: string;
}

const Cinemas: React.FC = () => {
    const [cinemas, setCinemas] = useState<Cinema[]>([]);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchCinemas(page);
    }, [page]);

    useIonViewWillEnter(() => {
        fetchCinemas(page);
    });

    const fetchCinemas = (currentPage: number = page) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.get(`/api/cinemas?page=${page}&limit=${limit}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        const cleanCinemas: Cinema[] = response.data.cinemas.map((cinema: any) => ({
                            _id: cinema._id,
                            name: cinema.name,
                            address: cinema.address,
                            city: cinema.city
                        }));
                        setTotalPages(response.data.totalPages);
                        setCinemas(cleanCinemas);
                        setErrorMessage('');
                    } else if (response.status === 404) {
                        setCinemas([]);
                        setErrorMessage(response.data.message);
                    }
                })
                .catch((err) => {
                    setErrorMessage(err.response.data.message);
                    console.error(err.response.data.message || err.message);
                });
        }
    };

    function deleteCinema(cinemaId: string) {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.delete(`/api/cinemas/${cinemaId}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 204) {
                        setSuccessMessage("Cinema successfully removed.");
                        if (cinemas.length === 1 && page > 1) {
                            setPage(prev => prev - 1);
                        } else {
                            fetchCinemas(page);
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
            {cinemas.length === 0 ? (
                <IonContent className='ion-padding'>
                    <div className='ion-text-right'>
                        <IonButton routerLink='/admin/cinemas/add' fill='solid' color={'success'}>Add <IonIcon icon={addCircleOutline} /></IonButton>
                    </div>
                    <p className='ion-padding ion-text-center'>{errorMessage}</p>
                    <div className="ion-text-center">
                        <IonButton disabled={page <= 1} onClick={() => setPage(prev => Math.max(prev - 1, 1))}>Previous</IonButton>
                        <span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
                        <IonButton disabled={page >= totalPages} onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}>Next</IonButton>
                    </div>
                </IonContent>
            ) : (
                <IonContent className='ion-padding'>
                    <div className='ion-text-right'>
                        <IonButton routerLink='/admin/cinemas/add' fill='solid' color={'success'}>Add <IonIcon icon={addCircleOutline} /></IonButton>
                    </div>
                    {cinemas.map(cinema => (
                        <IonCard className='ion-padding' key={cinema._id}>
                            <IonCardHeader>
                                <IonCardTitle>{cinema.name}</IonCardTitle>
                                <IonCardSubtitle><IonIcon icon={pinOutline} /> {cinema.address}, {cinema.city}</IonCardSubtitle>
                            </IonCardHeader>

                            <IonButton routerLink={`/admin/cinemas/${cinema._id}`} fill='solid' color={'primary'}>View <IonIcon icon={searchOutline} /></IonButton>
                            <IonButton routerLink={`/admin/cinemas/update/${cinema._id}`} fill='solid' color={'secondary'}>Edit <IonIcon icon={createOutline} /></IonButton>
                            <IonButton onClick={() => deleteCinema(cinema._id)} fill='solid' color={'danger'}>Remove <IonIcon icon={trashOutline} /></IonButton>
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
            )}
        </IonPage>
    );
};

export default Cinemas;
