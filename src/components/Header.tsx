import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router';
import { IonButton, IonButtons, IonIcon, IonPopover, IonTitle, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import axios from 'axios';
import { buildOutline, chevronDownOutline, exitOutline, personCircleOutline, ticketOutline } from 'ionicons/icons';

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    const [username, setUsername] = useState<string>('');
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
            axios.get(`http://192.168.0.12:3000/api/users/${userId}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        setUsername(response.data.username);
                        setIsAdmin(response.data.isAdmin);
                    }
                })
                .catch((err) => {
                    console.error('Error fetching user details:', err);
                });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setUsername('');
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
                {username ? (
                    <>
                        <IonButton onClick={handlePopover}>Welcome, {username} <IonIcon icon={chevronDownOutline} /></IonButton>
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
                        <IonButton routerLink={`/login`} fill='solid' color={'primary'}>Login</IonButton>
                        <IonButton routerLink={`/register`} fill='solid' color={'primary'}>Register</IonButton>
                    </>
                )}
            </IonButtons>
        </IonToolbar>
    );
};

export default Header;
