import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonImg, IonPage, IonRow, useIonViewWillEnter } from '@ionic/react';
import queryString from 'query-string';
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

	const location = useLocation();
	const history = useHistory();

	useIonViewWillEnter(() => {
		const { page: queryPage } = queryString.parse(location.search);
		const parsedPage = Math.max(parseInt(queryPage as string) || 1, 1);
		setPage(parsedPage);
		fetchMovies(parsedPage);
	});

	useEffect(() => {
		if (location.pathname === '/home') {
			const { page: queryPage } = queryString.parse(location.search);
			const parsedPage = Math.max(parseInt(queryPage as string) || 1, 1);
			setPage(parsedPage);
			fetchMovies(parsedPage);
		}
	}, [location.pathname, location.search]);

	const fetchMovies = (currentPage: number = 1) => {
		axios.get(`/api/movies?page=${currentPage}&limit=${limit}`)
			.then((response) => {
				if (response.status === 200) {

					if (!response.data.movies || response.data.movies.length === 0) {
						setMovies([]);
						setTotalPages(1);
						return;
					}

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
					setTotalPages(1);
					setMovies([]);
					setErrorMessage(response.data.message);
				}
			})
			.catch((err) => {
				setErrorMessage(err.response.data.message);
				console.error(err.response.data.message || err.message);
			});
	};

	const changePage = (newPage: number) => {
		if (newPage !== page) {
			history.push(`/home?page=${newPage}`);
			setPage(newPage);
		}
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
						<IonButton disabled={page <= 1} onClick={() => changePage(page - 1)}>Previous</IonButton>
						<span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
						<IonButton disabled={page >= totalPages} onClick={() => changePage(page + 1)}>Next</IonButton>
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
						<IonButton disabled={page <= 1} onClick={() => changePage(page - 1)}>Previous</IonButton>
						<span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
						<IonButton disabled={page >= totalPages} onClick={() => changePage(page + 1)}>Next</IonButton>
					</div>
				</IonContent>
			)}
		</IonPage>
	);
};

export default Home;
