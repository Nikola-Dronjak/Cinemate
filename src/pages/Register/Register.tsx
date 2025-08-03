import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonInput, IonPage, IonRow, IonToast } from '@ionic/react';
import { validateRegister } from './validateRegister';
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

const Register: React.FC = () => {
    const [user, setUser] = useState<Omit<User, '_id' | 'isAdmin' | 'profilePicture'>>({
        username: '',
        email: '',
        password: ''
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState<{
        username?: string;
        email?: string;
        password?: string
    }>({});

    const history = useHistory();

    async function handleSignUp(e: React.FormEvent) {
        e.preventDefault();

        setValidationErrors({});

        const validationErrors = await validateRegister(user, false);
        if (Object.keys(validationErrors).length > 0) {
            setValidationErrors(validationErrors);
        } else {
            axios.post('/api/users/register', user)
                .then((response) => {
                    if (response.status === 201) {
                        const token = response.data.token;
                        const decodedToken = JSON.parse(atob(token.split('.')[1]));
                        const { isAdmin } = decodedToken;
                        localStorage.setItem('authToken', token);
                        setUser({
                            username: '',
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
            <IonContent className='ion-padding' scrollY={false}>
                <IonGrid fixed>
                    <IonRow className='ion-justify-content-center'>
                        <IonCol size='12' sizeMd='8' sizeLg='6' sizeXl='4'>
                            <IonCard>
                                <IonCardHeader>
                                    <IonCardTitle>Create your account</IonCardTitle>
                                    <IonCardSubtitle>Please enter your username, email address and password</IonCardSubtitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <form onSubmit={handleSignUp}>
                                        <IonInput label='Username' type='text' placeholder='user123' labelPlacement='floating' fill='outline' clearInput={true} value={user.username} onIonInput={(e) => setUser({ ...user, username: e.detail.value?.trim() || '' })} />
                                        {validationErrors.username && <span style={{ color: 'red' }}>{validationErrors.username}</span>}
                                        <IonInput className='ion-margin-top' label='Email' type='text' placeholder='user@gmail.com' labelPlacement='floating' fill='outline' clearInput={true} value={user.email} onIonInput={(e) => setUser({ ...user, email: e.detail.value?.trim() || '' })} />
                                        {validationErrors.email && <span style={{ color: 'red' }}>{validationErrors.email}</span>}
                                        <IonInput className='ion-margin-top' label='Password' type='password' placeholder='Your password' labelPlacement='floating' fill='outline' clearInput={true} value={user.password} onIonInput={(e) => setUser({ ...user, password: e.detail.value?.trim() || '' })} />
                                        {validationErrors.password && <span style={{ color: 'red' }}>{validationErrors.password}</span>}
                                        <IonRow className='ion-justify-content-center'>
                                            <IonButton className='ion-margin-top ion-margin-bottom' type='submit' color={'primary'}>Create account</IonButton>
                                        </IonRow>
                                    </form>
                                    <p>Already have an account? <a href='/login'>Sign in!</a></p>
                                    <IonToast isOpen={errorMessage !== ''} message={errorMessage} duration={3000} color={'danger'} onDidDismiss={() => setErrorMessage('')} style={{
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

export default Register;