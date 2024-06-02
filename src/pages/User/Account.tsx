import React, { useState, useCallback } from 'react';
import { useHistory } from 'react-router';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonPage, IonRow, IonToast, useIonViewWillEnter } from '@ionic/react';
import { saveOutline, trashOutline } from 'ionicons/icons';
import { validateRegister } from '../Register/validateRegister';
import Header from '../../components/Header';
import axios from 'axios';

interface User {
    _id: string;
    username: string;
    email: string;
    password: string;
    isAdmin: boolean;
}

const Account: React.FC = () => {
    const [user, setUser] = useState<Omit<User, '_id' | 'isAdmin'>>({
        username: '',
        email: '',
        password: ''
    });

    const [successMessage, setSuccessMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState<{
        username?: string;
        email?: string;
        password?: string
    }>({});

    const history = useHistory();

    useIonViewWillEnter(() => {
        fetchUser();
    });

    const fetchUser = useCallback(() => {
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
                        const { username, email, password } = response.data;
                        setUser({ username, email, password })
                    }
                })
                .catch((err) => {
                    console.error('Error fetching user details:', err);
                });
        }
    }, []);

    const updateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        setValidationErrors({});

        const validationErrors = await validateRegister(user);
        if (Object.keys(validationErrors).length > 0) {
            setValidationErrors(validationErrors);
        } else {
            const token = localStorage.getItem('authToken');
            if (token) {
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                const { userId } = decodedToken;
                axios.put(`http://192.168.0.12:3000/api/users/${userId}`, user, {
                    headers: {
                        'x-auth-token': token,
                    }
                })
                    .then((response) => {
                        if (response.status === 200) {
                            setSuccessMessage("User successfully updated.");
                        }
                    })
                    .catch((err) => {
                        setValidationErrors(err.response.data);
                        console.log(err.response.data);
                    });
            }
        }
    };

    function deleteUser() {
        const token = localStorage.getItem('authToken');
        if (token) {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const { userId } = decodedToken;
            axios.delete(`http://192.168.0.12:3000/api/users/${userId}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 200) {
                        localStorage.removeItem('authToken');
                        history.push('/home');
                        setSuccessMessage("User successfully removed.");
                    } else {
                        console.log(response.data);
                    }
                })
                .catch((err) => {
                    console.log(err.response?.data || err.message);
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
                                    <IonCardTitle>User information</IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <form onSubmit={updateUser}>
                                        <IonInput label='Username' type='text' value={user.username} placeholder='user123' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setUser({ ...user, username: e.detail.value?.trim() || '' })} />
                                        {validationErrors.username && <span style={{ color: 'red' }}>{validationErrors.username}</span>}
                                        <IonInput className='ion-margin-top' label='Email' type='text' value={user.email} placeholder='example@gmail.com' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setUser({ ...user, email: e.detail.value?.trim() || '' })} />
                                        {validationErrors.email && <span style={{ color: 'red' }}>{validationErrors.email}</span>}
                                        <IonInput className='ion-margin-top' label='Password' type='password' placeholder='Your current/new password' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setUser({ ...user, password: e.detail.value?.trim() || '' })} />
                                        {validationErrors.password && <span style={{ color: 'red' }}>{validationErrors.password}</span>}
                                        <IonRow className='ion-justify-content-center'>
                                            <IonButton className='ion-margin-top' type='submit' color='primary'>Save <IonIcon icon={saveOutline} /></IonButton>
                                            <IonButton className='ion-margin-top' onClick={() => deleteUser()} color='danger'>Remove <IonIcon icon={trashOutline} /></IonButton>
                                        </IonRow>
                                    </form>
                                    <IonToast isOpen={successMessage !== ''} message={successMessage} duration={3000} color={'success'} onDidDismiss={() => setSuccessMessage('')} style={{
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

export default Account;
