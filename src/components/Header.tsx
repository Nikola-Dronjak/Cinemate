import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useTranslation } from "react-i18next";
import { IonButton, IonButtons, IonIcon, IonItem, IonPopover, IonTitle, IonToggle, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import { buildOutline, exitOutline, personCircleOutline, ticketOutline } from 'ionicons/icons';
import i18n from '../i18n';
import axios from '../api/AxiosInstance';
import { UserRoles } from '../enums/UserRoles';
import "flag-icons/css/flag-icons.min.css";

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [role, setRole] = useState<string>('');

    const [showPopover, setShowPopover] = useState(false);
    const [popoverEvent, setPopoverEvent] = useState<MouseEvent | undefined>(undefined);

    const [checked, setChecked] = useState(false);

    const history = useHistory();
    const { t } = useTranslation();

    useIonViewWillEnter(() => {
        checkUserLoggedIn();
    });

    useEffect(() => {
        setChecked(i18n.language === "de");
    }, []);

    const checkUserLoggedIn = useCallback(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const { userId, role } = decodedToken;
            axios.get(`/api/users/${userId}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        setProfilePicture(response.data.profilePicture || null);
                        setRole(role);
                    }
                })
                .catch((err) => {
                    console.error(err.response.data.message || err.message);
                });
        }
    }, []);

    const handleLogout = () => {
        const token = localStorage.getItem('authToken')!;
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const { userId } = decodedToken;
        axios.post('/api/users/logout', { userId }, {
            headers: {
                'x-auth-token': token
            }
        })
            .then((response) => {
                if (response.status === 200) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('refreshToken');
                    history.push('/home');
                }
            })
            .catch((err) => {
                console.error(err.response.data.message || err.message);
            });
    };

    const handlePopover = (e: React.MouseEvent<HTMLIonButtonElement>) => {
        setPopoverEvent(e.nativeEvent);
        setShowPopover(true);
    };

    const handleToggle = (e: CustomEvent<{ checked: boolean }>) => {
        const isOn = e.detail?.checked ?? false;
        setChecked(isOn);
        i18n.changeLanguage(isOn ? "de" : "en");
    };

    return (
        <IonToolbar>
            <IonTitle>
                <IonButton fill="clear" color={'dark'} size='large' routerLink="/home">{title}</IonButton>
            </IonTitle>
            <IonButtons slot="end">
                <IonItem lines="none" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="fi fi-us" style={{ marginRight: '4px', fontSize: '2em' }}></span>
                    <IonToggle checked={checked} onIonChange={handleToggle} />
                    <span className="fi fi-de" style={{ marginLeft: '-25px', fontSize: '2em' }}></span>
                </IonItem>
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
                                    <IonButton expand="block" color={'primary'} routerLink={`/account`} onClick={() => setShowPopover(false)}>{t('buttons.account')} <IonIcon icon={personCircleOutline} /></IonButton>
                                    <IonButton expand="block" color={'primary'} routerLink={`/reservations`} onClick={() => setShowPopover(false)}>{t('buttons.myReservations')} <IonIcon icon={ticketOutline} /></IonButton>
                                    {(role === UserRoles.Admin || role === UserRoles.Sales) && (
                                        <IonButton expand="block" color={'primary'} routerLink={`/admin`} onClick={() => setShowPopover(false)}>{t('buttons.adminPanel')} <IonIcon icon={buildOutline} /></IonButton>
                                    )}
                                    <IonButton expand="block" color={'danger'} onClick={() => { handleLogout(); setShowPopover(false); }}>{t('buttons.logout')} <IonIcon icon={exitOutline} /></IonButton>
                                </IonPopover>
                            </>
                        ) : (
                            <>
                                <IonButton onClick={handlePopover}><IonIcon icon={personCircleOutline} /></IonButton>
                                <IonPopover event={popoverEvent} isOpen={showPopover} onDidDismiss={() => setShowPopover(false)}>
                                    <IonButton expand="block" color={'primary'} routerLink={`/account`} onClick={() => setShowPopover(false)}>{t('buttons.account')} <IonIcon icon={personCircleOutline} /></IonButton>
                                    <IonButton expand="block" color={'primary'} routerLink={`/reservations`} onClick={() => setShowPopover(false)}>{t('buttons.myReservations')} <IonIcon icon={ticketOutline} /></IonButton>
                                    {(role === UserRoles.Admin || role === UserRoles.Sales) && (
                                        <IonButton expand="block" color={'primary'} routerLink={`/admin`} onClick={() => setShowPopover(false)}>{t('buttons.adminPanel')} <IonIcon icon={buildOutline} /></IonButton>
                                    )}
                                    <IonButton expand="block" color={'danger'} onClick={() => { handleLogout(); setShowPopover(false); }}>{t('buttons.logout')} <IonIcon icon={exitOutline} /></IonButton>
                                </IonPopover>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <IonButton routerLink={`/login`} fill='solid' color={'primary'}>{t("buttons.login")}</IonButton>
                        <IonButton routerLink={`/register`} fill='solid' color={'primary'}>{t("buttons.register")}</IonButton>
                    </>
                )}
            </IonButtons>
        </IonToolbar>
    );
};

export default Header;