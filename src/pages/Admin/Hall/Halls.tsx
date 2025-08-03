import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonPage, IonToast, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import { addCircleOutline, createOutline, searchOutline, trashOutline } from 'ionicons/icons';
import Header from '../../../components/Header';
import axios from '../../../api/AxiosInstance';

interface Cinema {
    _id: string;
    name: string;
    address: string;
    city: string;
}

interface Hall {
    _id: string,
    name: string,
    numberOfSeats: number,
    cinemaId: string
}

const Halls: React.FC = () => {
    const { cinemaId } = useParams<{ cinemaId: string }>();
    const [cinema, setCinema,] = useState<Omit<Cinema, '_id'>>({
        name: '',
        address: '',
        city: ''
    })

    const [halls, setHalls] = useState<Hall[]>([]);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchHalls(page);
    }, [page]);

    useIonViewWillEnter(() => {
        fetchHalls(page);
    });

    const fetchHalls = (currentPage: number = page) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.get(`/api/cinemas/${cinemaId}/halls?page=${page}&limit=${limit}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        const cleanHalls: Hall[] = response.data.halls.map((hall: any) => ({
                            _id: hall._id,
                            name: hall.name,
                            numberOfSeats: hall.numberOfSeats,
                            cinemaId: hall.cinemaId
                        }));
                        setTotalPages(response.data.totalPages);
                        setHalls(cleanHalls);
                        setErrorMessage('');
                    } else if (response.status === 404) {
                        setHalls([]);
                        setErrorMessage(response.data.message);
                    }
                })
                .catch((err) => {
                    setErrorMessage(err.response.data.message);
                    console.error(err.response.data.message || err.message);
                });

            axios.get(`/api/cinemas/${cinemaId}`)
                .then((response) => {
                    if (response.status === 200) {
                        const { name, address, city } = response.data;
                        setCinema({ name, address, city });
                    }
                })
                .catch((err) => {
                    setErrorMessage(err.response.data.message);
                    console.error(err.response.data.message || err.message);
                });
        }
    };

    function deleteHall(hallId: string) {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.delete(`/api/halls/${hallId}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 204) {
                        setSuccessMessage("Hall successfully removed.");
                        if (halls.length === 1 && page > 1) {
                            setPage(prev => prev - 1);
                        } else {
                            fetchHalls(page);
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
            {halls.length === 0 ? (
                <IonContent className="ion-padding">
                    <div className='ion-text-right'>
                    </div>
                    <IonCard className='ion-padding'>
                        <IonToolbar>
                            <IonCardTitle>{cinema.name}</IonCardTitle>
                            <IonButtons slot="end">
                                <IonButton routerLink={`/admin/halls/add/${cinemaId}`} fill='solid' color={'success'}>Add <IonIcon icon={addCircleOutline} /></IonButton>
                            </IonButtons>
                        </IonToolbar>
                        <IonCardContent>
                            <p className='ion-padding ion-text-center'>{errorMessage}</p>
                        </IonCardContent>
                    </IonCard>
                    <div className="ion-text-center">
                        <IonButton disabled={page <= 1} onClick={() => setPage(prev => Math.max(prev - 1, 1))}>Previous</IonButton>
                        <span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
                        <IonButton disabled={page >= totalPages} onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}>Next</IonButton>
                    </div>
                </IonContent>
            ) : (
                <IonContent className="ion-padding">
                    <div className='ion-text-right'>
                    </div>
                    <IonCard className='ion-padding'>
                        <IonToolbar>
                            <IonCardTitle>{cinema.name}</IonCardTitle>
                            <IonButtons slot="end">
                                <IonButton routerLink={`/admin/halls/add/${cinemaId}`} fill='solid' color={'success'}>Add <IonIcon icon={addCircleOutline} /></IonButton>
                            </IonButtons>
                        </IonToolbar>
                        <IonCardContent>
                            {halls.map(hall => (
                                <IonCard className='ion-padding' key={hall._id} color={'light'}>
                                    <IonCardHeader>
                                        <IonCardTitle>{hall.name}</IonCardTitle>
                                        <IonCardSubtitle>Capacity: {hall.numberOfSeats} seats</IonCardSubtitle>
                                    </IonCardHeader>

                                    <IonButton routerLink={`/admin/halls/${hall._id}`} fill='solid' color={'primary'}>View <IonIcon icon={searchOutline} /></IonButton>
                                    <IonButton routerLink={`/admin/halls/update/${hall._id}`} fill='solid' color={'secondary'}>Edit <IonIcon icon={createOutline} /></IonButton>
                                    <IonButton onClick={() => deleteHall(hall._id)} fill='solid' color={'danger'}>Remove <IonIcon icon={trashOutline} /></IonButton>
                                </IonCard>
                            ))}
                        </IonCardContent>
                    </IonCard>
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

export default Halls;