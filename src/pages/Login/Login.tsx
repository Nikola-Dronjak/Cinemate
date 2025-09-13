import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { useTranslation } from "react-i18next";
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonInput, IonPage, IonRow, IonToast } from '@ionic/react';
import { validateLogin } from './validateLogin';
import Header from '../../components/Header';
import axios from '../../api/AxiosInstance';

interface User {
    _id: string;
    username: string;
    email: string;
    password: string;
    isAdmin: boolean;
    profilePicture: string;
}

const Login: React.FC = () => {
    const [user, setUser] = useState<Omit<User, '_id' | 'username' | 'isAdmin' | 'profilePicture'>>({
        email: '',
        password: ''
    });

    const [toast, setToast] = useState<{ message: string; color: 'success' | 'danger' }>({ message: '', color: 'success' });
    const [validationErrors, setValidationErrors] = useState<{
        email?: string;
        password?: string
    }>({});

    const history = useHistory();
    const { t } = useTranslation();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        setValidationErrors({});

        const validationErrors = await validateLogin(user);
        if (Object.keys(validationErrors).length > 0) {
            setValidationErrors(validationErrors);
        } else {
            axios.post('/api/users/login', user)
                .then((response) => {
                    if (response.status === 200) {
                        const accessToken = response.data.accessToken;
                        const refreshToken = response.data.refreshToken;
                        const decodedAccessToken = JSON.parse(atob(accessToken.split('.')[1]));
                        const { isAdmin } = decodedAccessToken;
                        localStorage.setItem('authToken', accessToken);
                        localStorage.setItem('refreshToken', refreshToken);
                        setUser({
                            email: '',
                            password: ''
                        });

                        if (isAdmin) {
                            history.push('/admin');
                        } else {
                            history.push('/home');
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
            <IonContent className='ion-padding' scrollY={false}>
                <IonGrid fixed>
                    <IonRow className='ion-justify-content-center'>
                        <IonCol size='12' sizeMd='8' sizeLg='6' sizeXl='4'>
                            <IonCard>
                                <IonCardHeader>
                                    <IonCardTitle>{t('login.title')}</IonCardTitle>
                                    <IonCardSubtitle>{t('login.subtitle')}</IonCardSubtitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <form onSubmit={handleLogin}>
                                        <IonInput label={t('inputs.labels.email')} type='text' placeholder='user@gmail.com' labelPlacement='floating' fill='outline' clearInput={true} value={user.email} onIonInput={(e) => setUser({ ...user, email: e.detail.value?.trim() || '' })} />
                                        {validationErrors.email && <span style={{ color: 'red' }}>{validationErrors.email}</span>}
                                        <IonInput className='ion-margin-top' label={t('inputs.labels.password')} type='password' placeholder={t('inputs.placeholders.password')} labelPlacement='floating' fill='outline' clearInput={true} value={user.password} onIonInput={(e) => setUser({ ...user, password: e.detail.value?.trim() || '' })} />
                                        {validationErrors.password && <span style={{ color: 'red' }}>{validationErrors.password}</span>}
                                        <IonRow className='ion-justify-content-center'>
                                            <IonButton className='ion-margin-top ion-margin-bottom' type='submit' color={'primary'}>{t('buttons.signin')}</IonButton>
                                        </IonRow>
                                    </form>
                                    <p>{t('login.hasAccount')} <a href='/register'>{t('login.registrationLink')}</a></p>
                                    <IonToast isOpen={!!toast.message} message={toast.message} duration={3000} color={toast.color} onDidDismiss={() => setToast({ message: '', color: 'success' })} style={{
                                        position: 'fixed',
                                        top: '10px',
                                        right: '10px',
                                        width: 'auto',
                                        maxWidth: '300px',
                                        zIndex: 9999
                                    }} />
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default Login;