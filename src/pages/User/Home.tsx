import React, { useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonImg, IonPage, IonRow, useIonViewWillEnter } from '@ionic/react';
import Header from '../../components/Header';
import axios from '../../api/AxiosInstance';

interface Movie {
	_id: string;
	title: string;
	description: string;
	genre: string;
	director: string;
	releaseDate: string;
	duration: number;
	image: string;
	rating: number;
}

const Home: React.FC = () => {
	const [movies, setMovies] = useState<Movie[]>([]);

	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [totalPages, setTotalPages] = useState(1);

	const [errorMessage, setErrorMessage] = useState('');

	useIonViewWillEnter(() => {
		fetchMovies(page);
	});

	const fetchMovies = (currentPage: number = page) => {
		axios.get(`/api/movies?page=${page}&limit=${limit}`)
			.then((response) => {
				if (response.status === 200) {
					const cleanMovies: Movie[] = response.data.movies.map((movie: any) => ({
						_id: movie._id,
						title: movie.title,
						description: movie.description,
						genre: movie.genre,
						director: movie.director,
						releaseDate: movie.releaseDate,
						duration: movie.duration,
						image: movie.image,
						rating: movie.rating
					}));
					setTotalPages(response.data.totalPages);
					setMovies(cleanMovies);
					setErrorMessage('');
				} else if (response.status === 404) {
					setMovies([]);
					setErrorMessage(response.data.message);
				}
			})
			.catch((err) => {
				setErrorMessage(err.response.data.message);
				console.error(err.response.data.message || err.message);
			});
	};

	return (
		<IonPage>
			<IonHeader>
				<Header title='Cinemate' />
			</IonHeader>
			{movies.length === 0 ? (
				<IonContent className='ion-padding'>
					<p className='ion-padding ion-text-center'>{errorMessage}</p>
					<div className="ion-text-center">
						<IonButton disabled={page <= 1} onClick={() => setPage(prev => Math.max(prev - 1, 1))}>Previous</IonButton>
						<span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
						<IonButton disabled={page >= totalPages} onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}>Next</IonButton>
					</div>
				</IonContent>
			) : (
				<IonContent className='ion-padding'>
					<IonGrid>
						<IonRow>
							{movies.map(movie => (
								<IonCol size="12" sizeSm="6" sizeMd="4" sizeLg="3" key={movie._id}>
									<IonCard className='ion-padding'>
										<IonImg src={`${import.meta.env.VITE_SERVER_ADDRESS}/images/${movie.image}`} alt={movie.title} />
										<IonCardHeader>
											<IonCardTitle>{movie.title}</IonCardTitle>
											<IonCardSubtitle>Director: {movie.director}</IonCardSubtitle>
											<IonCardSubtitle>Genre: {movie.genre}</IonCardSubtitle>
											<IonCardSubtitle>Duration: {Math.floor(movie.duration / 60)}h {movie.duration % 60}min</IonCardSubtitle>
										</IonCardHeader>
										<IonCardContent>
											<IonRow className='ion-justify-content-center'>
												<IonButton routerLink={`/home/details/${movie._id}`} fill='solid' color={'primary'}>View</IonButton>
											</IonRow>
										</IonCardContent>
									</IonCard>
								</IonCol>
							))}
						</IonRow>
					</IonGrid>
					<div className="ion-text-center">
						<IonButton disabled={page <= 1} onClick={() => setPage(prev => Math.max(prev - 1, 1))}>Previous</IonButton>
						<span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
						<IonButton disabled={page >= totalPages} onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}>Next</IonButton>
					</div>
				</IonContent>
			)}
		</IonPage>
	);
};

export default Home;
