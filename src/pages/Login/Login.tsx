import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonInput, IonPage, IonRow } from '@ionic/react';
import { validateLogin } from './validateLogin';
import Header from '../../components/Header';
import axios from '../../api/AxiosInstance';

interface User {
    _id: string;
    username: string;
    email: string;
    password: string;
    isAdmin: boolean;
}

const Login: React.FC = () => {
    const [user, setUser] = useState<Omit<User, '_id' | 'username' | 'isAdmin'>>({
        email: '',
        password: ''
    });

    const [validationErrors, setValidationErrors] = useState<{
        email?: string;
        password?: string
    }>({});

    const history = useHistory();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        setValidationErrors({});

        const validationErrors = await validateLogin(user);
        if (Object.keys(validationErrors).length > 0) {
            setValidationErrors(validationErrors);
        } else {
            axios.post('/api/login', user)
                .then((response) => {
                    if (response.status === 200) {
                        const token = response.data;
                        const decodedToken = JSON.parse(atob(token.split('.')[1]));
                        const { isAdmin } = decodedToken;
                        localStorage.setItem('authToken', token);

                        if (isAdmin) {
                            history.push('/admin');
                        } else {
                            history.push('/home');
                        }
                    }
                })
                .catch((err) => {
                    setValidationErrors(err.response.data);
                    console.log(err.response.data);
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
                                    <IonCardTitle>Login</IonCardTitle>
                                    <IonCardSubtitle>Please enter your user credentials</IonCardSubtitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <form onSubmit={handleLogin}>
                                        <IonInput label='Email' type='text' placeholder='user@gmail.com' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setUser({ ...user, email: e.detail.value?.trim() || '' })} />
                                        {validationErrors.email && <span style={{ color: 'red' }}>{validationErrors.email}</span>}
                                        <IonInput className='ion-margin-top' label='Password' type='password' placeholder='Your password' labelPlacement='floating' fill='outline' clearInput={true} onIonInput={(e) => setUser({ ...user, password: e.detail.value?.trim() || '' })} />
                                        {validationErrors.password && <span style={{ color: 'red' }}>{validationErrors.password}</span>}
                                        <IonRow className='ion-justify-content-center'>
                                            <IonButton className='ion-margin-top ion-margin-bottom' type='submit' color={'primary'}>Sign in</IonButton>
                                        </IonRow>
                                    </form>
                                    <p>Dont have an account? <a href='/register'>Register now!</a></p>
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