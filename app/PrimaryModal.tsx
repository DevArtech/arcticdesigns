import styles from './css/primarymodal.module.css';
import React, { useEffect, useState } from 'react';
import { url } from './config/utils';
import ProductCard from './ProductCard'
import AvailableColor from './utils/availablecolors';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import LoadingSpinner from './LoadingSpinner';

interface PrimaryModalProps {
    popProductAdded(data: {name: string, image: string, color: string}): void;
}

function PrimaryModal(props: PrimaryModalProps) {
    const [searchBarPlaceholder, setSearchBarPlaceholder] = useState("");
    const [productCards, setProductCards] = useState<React.ReactNode[]>([]);
    const [initialLoad, setInitialLoad] = useState(false);
    const [recommendedItem, setRecommendedItem] = useState<React.ReactNode>();
    const [loading, setLoading] = useState(true);
    const [recommendedLoading, setRecommendedLoading] = useState(true);

    const responsive = {
        superLargeDesktop: {
            breakpoint: { max: 4000, min: 3000 },
            items: 4,
            slidesToSlide: 2
          },
          desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 4,
            slidesToSlide: 2
          },
          tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 4,
            slidesToSlide: 2
          },
          mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 4,
            slidesToSlide: 2
          }
      };

    function focusSearchField() {
        const searchField = document.getElementById("searchField") as HTMLInputElement;
        searchField.focus();
    }

    useEffect(() => {
        async function fetchData() {
          const response = await fetch(url("/api/products/total-count"), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          const productCount = await response.json();
          setSearchBarPlaceholder(`Search from ${productCount} products`)
        }
    
        fetchData();
    }, []);

    useEffect(() => {
        function generateProductCards() {
            async function fetchData() {
                const headerObject = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
                const colorResponse = await fetch(url("/api/misc-data/available-colors"), headerObject);
                const colorData = await colorResponse.json();
                const availableColors: AvailableColor[] = Object.entries(colorData).map(([color, availability]) => ({
                    color: color as string,
                    available: availability as boolean
                }));

                const primaryResponse = await fetch(url("/api/products/get-random-products/10"), headerObject);
                const products = await primaryResponse.json();
                let i = 0;
                let mappedProductCards = products.map((product: {prod_id: string, name: string, images: string[], price: number, rating: number, redirect: string, colors: string[]}) => {
                    i++;
                    return <ProductCard 
                            key={product.prod_id}
                            id={product.prod_id}
                            name={product.name} 
                            image={product.images[0]} 
                            price={product.price} 
                            rating={product.rating} 
                            colorOptions={product.colors}
                            availableColors={availableColors}
                            redirect={`/product/${product.prod_id}`}
                            largeCard={false}
                            popProductAdded={props.popProductAdded}/>
                });
                setProductCards(productCards.length <= 0 ? mappedProductCards : productCards);
                setLoading(false);

                const recommendedResponse = await fetch(url("/api/products/get-user-recommended-item"), headerObject);
                const recommendedProduct = await recommendedResponse.json();
                setRecommendedItem(<ProductCard 
                    key={recommendedProduct.id}
                    id={recommendedProduct.prod_id}
                    name={recommendedProduct.name} 
                    image={recommendedProduct.images[0]} 
                    price={recommendedProduct.price} 
                    rating={recommendedProduct.rating} 
                    colorOptions={recommendedProduct.colors}
                    availableColors={availableColors}
                    redirect={`/product/${recommendedProduct.prod_id}`}
                    largeCard={true}
                    popProductAdded={props.popProductAdded}/>);
                setRecommendedLoading(false);
            }
            fetchData();
        }

        if(!initialLoad) {
            generateProductCards();
            setInitialLoad(true);
        }
    }, [initialLoad, productCards]);

    return (
        <div className={styles["primary-modal"]}>
            <div className={styles["inner-elements"]}>
                <div className={styles["modal-elements"]}>
                    <h1 className={styles["modal-tag"]}>Printer to Home</h1>
                    <p className={styles["modal-add-text"]}>Quality 3D printed products delivered straight to you.</p>
                    <a href="/products" className={styles["visit-shop-button"]}>
                        <p style={{position: 'absolute', margin: '0.4rem 3.75rem'}}>Visit Shop</p>
                        <div className={styles["visit-shop-modal-border"]}></div>
                    </a>
                    <div style={{width: '110%', display : 'flex', marginTop: '1.25rem', gap: '0.5rem'}}>
                    <button onClick={focusSearchField} className={styles["search-bar"]}>
                        <svg className={styles["search-icon"]} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xmlSpace="preserve">
                            <defs/>
                            <g transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)" >
                                <path d="M 87.803 77.194 L 68.212 57.602 c 9.5 -14.422 7.912 -34.054 -4.766 -46.732 c 0 0 -0.001 0 -0.001 0 c -14.495 -14.493 -38.08 -14.494 -52.574 0 c -14.494 14.495 -14.494 38.079 0 52.575 c 7.248 7.247 16.767 10.87 26.287 10.87 c 7.134 0 14.267 -2.035 20.445 -6.104 l 19.591 19.591 C 78.659 89.267 80.579 90 82.498 90 s 3.84 -0.733 5.305 -2.197 C 90.732 84.873 90.732 80.124 87.803 77.194 z M 21.48 52.837 c -8.645 -8.646 -8.645 -22.713 0 -31.358 c 4.323 -4.322 10 -6.483 15.679 -6.483 c 5.678 0 11.356 2.161 15.678 6.483 c 8.644 8.644 8.645 22.707 0.005 31.352 c -0.002 0.002 -0.004 0.003 -0.005 0.005 c -0.002 0.002 -0.003 0.003 -0.004 0.005 C 44.184 61.481 30.123 61.48 21.48 52.837 z" transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round" />
                            </g>
                        </svg>
                        <span/>
                            <input id="searchField" className={styles["search-input-field"]} type="text" placeholder={searchBarPlaceholder}/>
                    </button>
                    <button className={styles["search-button"]}>Search</button>
                    </div>
                </div>
                <div className={styles["carousel-loader"]}>
                    {
                        loading && <LoadingSpinner color={"#48B8FE"} solid={false} />
                    }
                </div>
                <div className={styles["recommended-loader"]}>
                    {
                        recommendedLoading && <LoadingSpinner color={"#48B8FE"} solid={false} />
                    }
                </div>
                <Carousel 
                    containerClass={styles["product-cards"]} 
                    responsive={responsive}
                    infinite={true}
                    showDots={true}
                    removeArrowOnDeviceType={["tablet", "mobile"]}>
                    { productCards }
                </Carousel>
                { recommendedItem }
                <img className={styles["modal-background"]} src="/primary-modal-background.png" alt="Collection of 3D printed items on a blue background" />
            </div>
        </div>
    );
}

export default PrimaryModal;