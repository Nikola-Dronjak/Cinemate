import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router';
import { IonButton, IonButtons, IonIcon, IonPopover, IonTitle, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import axios from '../api/AxiosInstance';
import { buildOutline, exitOutline, personCircleOutline, ticketOutline } from 'ionicons/icons';

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    const [showPopover, setShowPopover] = useState(false);
    const [popoverEvent, setPopoverEvent] = useState<MouseEvent | undefined>(undefined);

    const history = useHistory();

    useIonViewWillEnter(() => {
        checkUserLoggedIn();
    });

    const checkUserLoggedIn = useCallback(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const { userId } = decodedToken;
            axios.get(`/api/users/${userId}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        setProfilePicture(response.data.profilePicture || null);
                        setIsAdmin(response.data.isAdmin);
                    }
                })
                .catch((err) => {
                    console.error(err.response.data.message || err.message);
                });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        history.push('/home');
    };

    const handlePopover = (e: React.MouseEvent<HTMLIonButtonElement>) => {
        setPopoverEvent(e.nativeEvent);
        setShowPopover(true);
    };

    return (
        <IonToolbar>
            <IonTitle>
                <IonButton fill="clear" color={'dark'} size='large' routerLink="/home">{title}</IonButton>
            </IonTitle>
            <IonButtons slot="end">
                {localStorage.getItem('authToken') ? (
                    <>
                        {profilePicture ? (
                            <>
                                <IonButton onClick={handlePopover}>
                                    <img
                                        src={`${import.meta.env.VITE_SERVER_ADDRESS}/images/${profilePicture}`}
                                        alt="Profile Picture"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '2px solid #ccc'
                                        }}
                                    />
                                </IonButton>
                                <IonPopover event={popoverEvent} isOpen={showPopover} onDidDismiss={() => setShowPopover(false)}>
                                    <IonButton expand="block" color={'primary'} routerLink={`/account`} onClick={() => setShowPopover(false)}>Account <IonIcon icon={personCircleOutline} /></IonButton>
                                    <IonButton expand="block" color={'primary'} routerLink={`/reservations`} onClick={() => setShowPopover(false)}>My Reservation <IonIcon icon={ticketOutline} /></IonButton>
                                    {isAdmin && (
                                        <IonButton expand="block" color={'primary'} routerLink={`/admin`} onClick={() => setShowPopover(false)}>Admin Panel <IonIcon icon={buildOutline} /></IonButton>
                                    )}
                                    <IonButton expand="block" color={'danger'} onClick={() => { handleLogout(); setShowPopover(false); }}>Logout <IonIcon icon={exitOutline} /></IonButton>
                                </IonPopover>
                            </>
                        ) : (
                            <>
                                <IonButton onClick={handlePopover}><IonIcon icon={personCircleOutline} /></IonButton>
                                <IonPopover event={popoverEvent} isOpen={showPopover} onDidDismiss={() => setShowPopover(false)}>
                                    <IonButton expand="block" color={'primary'} routerLink={`/account`} onClick={() => setShowPopover(false)}>Account <IonIcon icon={personCircleOutline} /></IonButton>
                                    <IonButton expand="block" color={'primary'} routerLink={`/reservations`} onClick={() => setShowPopover(false)}>My Reservation <IonIcon icon={ticketOutline} /></IonButton>
                                    {isAdmin && (
                                        <IonButton expand="block" color={'primary'} routerLink={`/admin`} onClick={() => setShowPopover(false)}>Admin Panel <IonIcon icon={buildOutline} /></IonButton>
                                    )}
                                    <IonButton expand="block" color={'danger'} onClick={() => { handleLogout(); setShowPopover(false); }}>Logout <IonIcon icon={exitOutline} /></IonButton>
                                </IonPopover>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <IonButton routerLink={`/login`} fill='solid' color={'primary'}>Login</IonButton>
                        <IonButton routerLink={`/register`} fill='solid' color={'primary'}>Register</IonButton>
                    </>
                )}
            </IonButtons>
        </IonToolbar>
    );
};

export default Header;
