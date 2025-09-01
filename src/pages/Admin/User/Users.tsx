import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonToast, useIonViewWillEnter } from '@ionic/react';
import { saveOutline, trashOutline } from 'ionicons/icons';
import queryString from 'query-string';
import Header from '../../../components/Header';
import axios from '../../../api/AxiosInstance';
import { UserRoles } from '../../../enums/UserRoles';

interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
}

const Users: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [userRole, setUserRole] = useState<{ [key: string]: string }>({});

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [toast, setToast] = useState<{ message: string; color: 'success' | 'danger' }>({ message: '', color: 'success' });

    const location = useLocation();
    const history = useHistory();

    useIonViewWillEnter(() => {
        const { page: queryPage } = queryString.parse(location.search);
        const parsedPage = Math.max(parseInt(queryPage as string) || 1, 1);
        setPage(parsedPage);
        fetchUsers(parsedPage);
    });

    useEffect(() => {
        if (location.pathname === '/admin/users') {
            const { page: queryPage } = queryString.parse(location.search);
            const parsedPage = Math.max(parseInt(queryPage as string) || 1, 1);
            setPage(parsedPage);
            fetchUsers(parsedPage);
        }
    }, [location.pathname, location.search]);

    const fetchUsers = (currentPage: number = 1) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.get(`/api/users?page=${currentPage}&limit=${limit}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 200) {

                        if (!response.data.users || response.data.users.length === 0) {
                            setUsers([]);
                            setTotalPages(1);
                            return;
                        }

                        const cleanUsers: User[] = response.data.users.map((user: any) => ({
                            _id: user._id,
                            username: user.username,
                            email: user.email,
                            role: user.role
                        }));
                        setTotalPages(response.data.totalPages);
                        setUsers(cleanUsers);
                        setUserRole({});
                    }
                })
                .catch((err) => {
                    if (err.response.status === 404) {
                        setTotalPages(1);
                        setUsers([]);
                    } else {
                        setToast({ message: err.response.data.message, color: 'danger' });
                        console.error(err.response.data.message || err.message);
                    }
                });
        }
    };

    const changePage = (newPage: number) => {
        if (newPage !== page) {
            history.push(`/admin/users?page=${newPage}`);
            setPage(newPage);
        }
    };

    function changeUserRole(userId: string) {
        const newRole = userRole[userId] ?? users.find(u => u._id === userId)?.role;

        if (!newRole || !Object.values(UserRoles).includes(newRole as UserRoles)) {
            setToast({ message: "Invalid user role.", color: 'danger' });
            return;
        }

        const token = localStorage.getItem('authToken');
        if (token) {
            axios.patch(`/api/users/${userId}/role`,
                { role: newRole },
                { headers: { 'x-auth-token': token } }
            )
                .then((response) => {
                    if (response.status === 200) {
                        setToast({ message: "User role successfully updated.", color: 'success' });
                        fetchUsers(page);
                    }
                })
                .catch((err) => {
                    setToast({ message: err.response?.data?.message || err.message, color: 'danger' });
                });
        }
    }

    function deleteUser(userId: string) {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.delete(`/api/users/${userId}`, {
                headers: {
                    'x-auth-token': token,
                }
            })
                .then((response) => {
                    if (response.status === 204) {
                        setToast({ message: "User successfully removed.", color: 'success' });
                        const updatedUsers = users.filter(user => user._id !== userId);
                        const isLastItemOnPage = updatedUsers.length === 0;
                        const newPage = isLastItemOnPage && page > 1 ? page - 1 : page;

                        if (newPage !== page) {
                            history.push(`/admin/users?page=${newPage}`);
                        } else {
                            setUsers(updatedUsers);
                            fetchUsers(page);
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
            {users.length === 0 ? (
                <IonContent className='ion-padding'>
                    <p className='ion-padding ion-text-center'>There are no users in the database right now.</p>
                    <div className="ion-text-center">
                        <IonButton disabled={page <= 1} onClick={() => changePage(page - 1)}>Previous</IonButton>
                        <span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
                        <IonButton disabled={page >= totalPages} onClick={() => changePage(page + 1)}>Next</IonButton>
                    </div>
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
                        <IonList>
                            {users.map(user => (
                                <IonCard key={user._id} color={'light'}>
                                    <IonCardHeader>
                                        <IonCardTitle>{user.username}</IonCardTitle>
                                        <IonCardSubtitle>{user.email}</IonCardSubtitle>
                                    </IonCardHeader>
                                    <IonCardContent>
                                        <IonItem>
                                            <IonLabel>Role</IonLabel>
                                            <IonSelect value={userRole[user._id] ?? user.role} onIonChange={e => setUserRole(prev => ({ ...prev, [user._id]: e.detail.value }))}>
                                                {Object.values(UserRoles).map(role => (
                                                    <IonSelectOption key={role} value={role}>
                                                        {role}
                                                    </IonSelectOption>
                                                ))}
                                            </IonSelect>
                                        </IonItem>
                                        <div className='ion-padding' style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                                            <IonButton onClick={() => changeUserRole(user._id)} color="success">Save <IonIcon icon={saveOutline} /></IonButton>
                                            <IonButton onClick={() => deleteUser(user._id)} color="danger">Remove <IonIcon icon={trashOutline} /></IonButton>
                                        </div>
                                    </IonCardContent>
                                </IonCard>
                            ))}
                        </IonList>
                    </IonCard>
                    <div className="ion-text-center">
                        <IonButton disabled={page <= 1} onClick={() => changePage(page - 1)}>Previous</IonButton>
                        <span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
                        <IonButton disabled={page >= totalPages} onClick={() => changePage(page + 1)}>Next</IonButton>
                    </div>
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
};

export default Users;